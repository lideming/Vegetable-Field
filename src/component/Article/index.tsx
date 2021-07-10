import axios from "axios";
import React, { useEffect, useState } from "react";
import MarkdownUtlis from "../../utlis/markdown-utlis";

function Article() {
    const [content, setContent] = useState<string>(null!);
    const [title, setTitle] = useState<string>();
    const [author, setAuthor] = useState<string>();
    const [chapter, setChapter] = useState<string>();
    const [testScript, setTestScript] = useState<string>(null!);

    useEffect(() => {
        const loading = async () => {
            const text = await axios.get('./chapter-8/Array.md');

            const parseRes = MarkdownUtlis.parse(text.data);

            console.log(parseRes);

            setTitle(parseRes.title);
            setAuthor(parseRes.author);
            setChapter(parseRes.chapter);
            setContent(parseRes.html);
            setTestScript(parseRes.testScript);
        }

        loading();
    }, []);

    const handleOnTest = () => {
        eval(testScript);
    }

    return (
        <section className="article-clean"
            style={{ fontFamily: "-apple-system,BlinkMacSystemFont,Noto Sans CJK SC,Arial,Helvetica Neue !important;" }}
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
                        <textarea style={{ width: "100%", height: 300 }}></textarea>
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={e => handleOnTest()}>
                            测试
                        </button>

                        <button className="btn btn-success" type="button" style={{ margin: 10 }}>查看答案</button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Article;