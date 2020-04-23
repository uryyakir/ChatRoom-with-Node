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

async function messageHandler() {
    let messageText = document.getElementsByClassName('write_msg')[0].value;
    if (Boolean(messageText)) {
        await fetch('/chat', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                cookie: document.cookie
            },
            body: JSON.stringify({messageText: messageText})
        }).then(resp => resp.json());
        clearInput();
        // TODO: remove automatic message append to HTML on sending user - he should be updated via server as well
        // TODO: set background color of message fitting to server decision
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getMessages() {
    while (1===1) {
        const serverResponse = await fetch('/chatData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                cookie: document.cookie
            }
        }).then(resp => resp.json());
        if (!serverResponse['updated']) {
            displayReceivedMessage(serverResponse);
        }
        await sleep(100);
    }
}