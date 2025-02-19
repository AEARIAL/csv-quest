import React, { useState } from "react";
import Papa from "papaparse";

function QuizApp() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [choices, setChoices] = useState([]);
    const [fileLoaded, setFileLoaded] = useState(false);
    const [history, setHistory] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = function (e) {
            const csv = e.target.result;
            let parsed = Papa.parse(csv, { header: false }).data.filter(row => row.length >= 2);
            
            // 問題をシャッフルする
            parsed = shuffleArray(parsed);
    
            setQuestions(parsed);
            setFileLoaded(true);
            setCurrentQuestionIndex(0);
            setScore(0);
            setShowResults(false);
            setHistory([]);
            generateChoices(parsed, 0);
        };
        reader.readAsText(file);
    }
    
    // 配列をシャッフルする関数
    function shuffleArray(array) {
        return array
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }
    

    function generateChoices(questions, index) {
        if (index >= questions.length) return;
        const correctAnswer = questions[index][1];
        const otherAnswers = questions
            .filter((_, i) => i !== index)
            .map(q => q[1])
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const allChoices = [...otherAnswers, correctAnswer].sort(() => 0.5 - Math.random());
        setChoices(allChoices);
    }

    function handleAnswerClick(answer) {
        const isCorrect = answer === questions[currentQuestionIndex][1];
        
        setHistory(prevHistory => {
            const updatedHistory = [
                ...prevHistory,
                { 
                    mark: isCorrect ? "○" : "✕", 
                    question: questions[currentQuestionIndex][0], 
                    answer: questions[currentQuestionIndex][1]
                }
            ];
            return updatedHistory.slice(-10);
        });

        if (isCorrect) {
            setScore(score + 1);
        }

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            generateChoices(questions, nextIndex);
        } else {
            setShowResults(true);
        }
    }

    function handleHistoryClick(item) {
        setSelectedHistory(item);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setSelectedHistory(null);
    }

    return (
        <div className="container">
            {!fileLoaded ? (
                <div>
                    <h2>CSVファイルをアップロード</h2>
                    <input type="file" accept=".csv" onChange={handleFileUpload} />
                </div>
            ) : showResults ? (
                <div>
                    <h2>結果発表</h2>
                    <p>{questions.length}問中 {score}問正解！</p>
                    <div className="history">
                        <h3>全解答履歴</h3>
                        <p>
                            {history.length > 0 ? history.map((item, index) => (
                                <span 
                                    key={index} 
                                    className="history-item" 
                                    onClick={() => handleHistoryClick(item)}
                                >
                                    {item.mark}
                                </span>
                            )) : "まだ解答なし"}
                        </p>
                    </div>
                    <button onClick={() => setFileLoaded(false)}>もう一度</button>
                </div>
            ) : (
                <div>
                    <h2>問題 {currentQuestionIndex + 1}/{questions.length}</h2>
                    <p>{questions[currentQuestionIndex][0]}</p>
                    {choices.map((choice, index) => (
                        <button key={index} onClick={() => handleAnswerClick(choice)}>
                            {choice}
                        </button>
                    ))}
                    <div className="history">
                        <h3>直近10問の履歴</h3>
                        <p>
                            {history.length > 0 ? history.map((item, index) => (
                                <span 
                                    key={index} 
                                    className="history-item" 
                                    onClick={() => handleHistoryClick(item)}
                                >
                                    {item.mark}
                                </span>
                            )) : "まだ解答なし"}
                        </p>
                    </div>
                </div>
            )}
            {modalOpen && selectedHistory && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>過去の問題</h3>
                        <p><strong>問題:</strong> {selectedHistory.question}</p>
                        <p><strong>正解:</strong> {selectedHistory.answer}</p>
                        <button onClick={closeModal}>閉じる</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizApp;