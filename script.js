document.addEventListener("DOMContentLoaded", function () {
    let recognition;
    let transcriptText = "";
    
    const startButton = document.getElementById("start-recording");
    const stopButton = document.getElementById("stop-recording");
    const transcriptDisplay = document.getElementById("transcript");
    const meetingInfo = document.getElementById("meeting-info");
    const taskInfo = document.getElementById("task-info");
    const reminderInfo = document.getElementById("reminder-info");
    const summaryContent = document.getElementById("summary-content");
    const sendEmailButton = document.getElementById("send-email");

    function setupSpeechRecognition() {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech Recognition not supported in this browser. Try Chrome!");
            return;
        }

        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = function () {
            transcriptText = "";
            transcriptDisplay.textContent = "🎙️ Listening...";
            startButton.disabled = true;
            stopButton.disabled = false;
        };

        recognition.onresult = function (event) {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcriptText += event.results[i][0].transcript + " ";
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            transcriptDisplay.textContent = transcriptText + interimTranscript;
        };

        recognition.onerror = function (event) {
            console.error("Speech Recognition Error:", event.error);
            alert("Error with speech recognition. Try again.");
            startButton.disabled = false;
            stopButton.disabled = true;
        };

        recognition.onend = function () {
            startButton.disabled = false;
            stopButton.disabled = true;
            extractActionItems();
        };

        recognition.start();
    }

    function extractActionItems() {
        if (!transcriptText) {
            alert("No speech detected!");
            return;
        }

        const taskRegex = /(?:task|action item|todo)\s(.*?)(?=\.|$)/gi;
        const dateRegex = /\b(?:on|by|next|at|in)\s(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}:\d{2}\s(?:AM|PM))\b/gi;
        const keyPointsRegex = /(?:key point|important)\s(.*?)(?=\.|$)/gi;

        const taskMatches = transcriptText.match(taskRegex) || [];
        const dateMatches = transcriptText.match(dateRegex) || [];
        const keyPointsMatches = transcriptText.match(keyPointsRegex) || [];

        taskInfo.textContent = "📝 Tasks: " + (taskMatches.length ? taskMatches.join(", ") : "None");
        meetingInfo.textContent = "📅 Meeting Dates: " + (dateMatches.length ? dateMatches.join(", ") : "None");
        reminderInfo.textContent = "🔑 Key Points: " + (keyPointsMatches.length ? keyPointsMatches.join(", ") : "None");

        summaryContent.textContent = `Transcription: ${transcriptText}\n\nMeeting: ${meetingInfo.textContent}\nTasks: ${taskInfo.textContent}\nKey Points: ${reminderInfo.textContent}`;
    }

    function sendSummaryEmail() {
        emailjs.init("ECWAeODiG_0mClBVi");

        const emailParams = {
            to_email: "mohammadkavish979@gmail.com",
            subject: "Meeting Notes & Tasks",
            message: summaryContent.textContent
        };

        emailjs.send("service_m0vumue", "template_y1f6qod", emailParams)
            .then(function (response) {
                console.log("✅ Email sent successfully:", response);
                alert("📧 Summary sent to your email.");
            })
            .catch(function (error) {
                console.error("❌ Email sending failed:", error);
                alert("❌ Failed to send email. Please try again.");
            });
    }

    startButton.addEventListener("click", setupSpeechRecognition);
    stopButton.addEventListener("click", function () {
        recognition.stop();
    });

    sendEmailButton.addEventListener("click", sendSummaryEmail);
});
