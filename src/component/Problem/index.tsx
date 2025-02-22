import axios from "axios";
import React, { useEffect, useState } from "react";
import MarkdownUtlis from "../../utlis/markdown-utlis";
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'highlight.js/styles/vs.css';
import './code.css';
import 'codemirror/lib/codemirror.css';

import 'codemirror/theme/neo.css';
import 'codemirror/addon/hint/show-hint.css';

import style from './index.module.scss';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';

import { requestUrlToFileUrl } from "../../utlis";


const createNewConsole = `
function createNewConsole() {
    function logger(...args) {
        outputs.push(Array.of(args));
    }

    let outputs = [];
    const myConsole = {};

    myConsole['log'] = logger;
    myConsole['info'] = logger;
    myConsole['warn'] = logger;
    myConsole['error'] = logger;

    const getOutputs = () => outputs;
    return [myConsole, getOutputs];
};

const [newConsole, getOutputs] = createNewConsole();
const oldConsole = console;
console = newConsole;
`



function Problem({ location }: any) {
    const [content, setContent] = useState<string>(null!);
    const [title, setTitle] = useState<string>(null!);
    const [author, setAuthor] = useState<string>(null!);
    const [chapter, setChapter] = useState<string>(null!);
    const [testScript, setTestScript] = useState<string>(null!);
    let [inputScript, setInputScript] = useState<string>(null!);

    useEffect(() => {
        const loading = async () => {
            const text = await axios.get(requestUrlToFileUrl(location.pathname));
            const parseRes = MarkdownUtlis.parse(text.data);

            setTitle(parseRes.title);
            setAuthor(parseRes.author);
            setChapter(parseRes.chapter);
            setContent(parseRes.html);
            setTestScript(parseRes.script.test);
            setInputScript(parseRes.script.template);
        }

        loading();
    }, [location.pathname]);


    const [resultMsg, setResultMsg] = useState<string>("");
    const [testTime, setTestTime] = useState<string>(new Date().toString());
    const [outputs, setOutputs] = useState<string>(null!);
    const handleOnTest = () => {

        try {
            const oldConsole = console;
            const eva = (str: string) => {
                return (0, eval)(str);
            }
            const testEnv = eva(`'use strict';
                ${createNewConsole};
                ${inputScript};
                (e) => eval(e);\r\n`
            );
            const judger = eva(`(function(env) {
                'use strict'; 
                const getOutputs = env('getOutputs');
                return [(function(){${testScript}})(), getOutputs()];}
                )`
            );
            const [testResult, outputs] = judger(testEnv);
            console = oldConsole;

            setOutputs(formatOutput(outputs));

            if (testResult === true && typeof testResult === "boolean") {
                setResultMsg("Success!");
            } else if (testResult === false && typeof testResult === "boolean") {
                setResultMsg("Wrong!");
            }
        } catch (e) {
            console.error(e);
            setResultMsg("Unexpected error! <br/>" + e.stack.split("\n")[0]);
        }
        setTestTime(new Date().toString());
        setInputScript(inputScript);
    }

    return (
        <section className={`article-clean ${style.article}`}
        >
            <div className="container">
                <div className="row">
                    <div className="col-lg-10 col-xl-12 offset-lg-1 offset-xl-0">
                        <div className="intro">
                            <h1 className="text-center">{title}</h1>
                            <p className="text-center">
                                <span className="by">by</span>
                                <a href="#">{author}</a>
                                <span className="date">{chapter}</span>
                            </p>
                        </div>
                        <div className="text" dangerouslySetInnerHTML={{ __html: content }}>
                        </div>
                        <div className={style.codeinputCard}>
                            <CodeMirror
                                className={style.codemirror}
                                value={inputScript}
                                options={{
                                    mode: "javascript",
                                    theme: "neo",
                                    lineNumbers: true,
                                    indentUnit: 4,
                                    inputStyle: "contenteditable",
                                    matchBrackets: true,
                                    autoCloseBrackets: true,
                                    extraKeys: {
                                        "Ctrl-Space": "autocomplete"
                                    },
                                }}
                                onChange={(editor, data, value) => {
                                    inputScript = value;
                                }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={e => handleOnTest()}>
                            测试
                        </button>

                        <button className="btn btn-success" type="button" data-toggle="modal" data-target="#staticBackdrop" style={{ margin: 20 }}>查看答案</button>

                        {outputs ?
                            <div className="alert alert-info" role="alert">
                                <p><strong>{"[console]"}</strong></p>
                                <span dangerouslySetInnerHTML={{__html: outputs}}/>
                            </div> : ''
                        }

                        {resultMsg ?
                            <div className={`alert ${resultMsg === "Success!" ? "alert-success" : "alert-danger"}`} role="alert">
                                <p><strong>{testTime}</strong></p>
                                <span dangerouslySetInnerHTML={{__html: resultMsg}}/>
                            </div> : ''
                        }


                        <div className="modal fade" id="staticBackdrop" data-keyboard="false" tabIndex={"-1" as any} aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="staticBackdropLabel">参考答案</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        懒到家了哈哈哈哈哈哈，根本不想写答案！
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-success" data-dismiss="modal">好的我明白</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Problem;

function formatOutput(outputs: Array<Array<any>>): string {
    let res = "";
    for (const line of outputs) {
        for (const array of line) {
            for (const it of array) {
                res = res + JSON.stringify(it) + " ";
            }
        }
        res = res + "<br/>";
    }
    return res;
}