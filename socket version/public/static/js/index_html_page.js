function clearInput() {
    document.getElementsByClassName('write_msg')[0].value = '';
}

function updateScroll(){
    const msgHistory = document.getElementsByClassName('msg_history')[0];
    msgHistory.scrollTop = msgHistory.scrollHeight;
}

function addMessage(messageText, msgHistoryObj) {
    const currentDate = new Date();
    const israelTime = currentDate.toLocaleDateString('he-IL', {day: "2-digit", month: "2-digit", year: "numeric", hour: "numeric", hour12: false, minute: "2-digit"});
    if (messageText["type"] === "message") {
        let next_html = `
                <div class="outgoing_msg">
                    <div class="sent_msg">
                        <p style="background-color:${messageText["message"]['color']}"><b><u>${messageText["message"]["sender"]}</u>:</b><br>${messageText["message"]["message"]}</p>
                        <span class="time_date">${israelTime}</span>
                    </div>
                </div>`;
        msgHistoryObj.insertAdjacentHTML('beforeend', next_html);
    }

    else if (messageText["type"] === "user") {
        let next_html = `
                <p dir="ltr">${messageText["message"]} has joined the chat!</p>`;
        msgHistoryObj.insertAdjacentHTML('beforeend', next_html);
    }
}

function displayReceivedMessage(messageText) {
    const msgHistory = document.getElementsByClassName('msg_history')[0];
    addMessage(messageText, msgHistory);
    updateScroll();
}

async function messageHandler(socket) {
    let messageText = document.getElementsByClassName('write_msg')[0].value;
    if (Boolean(messageText)) {
        socket.emit('chat message', {text: messageText, username: document.cookie});
        clearInput();
    }
}