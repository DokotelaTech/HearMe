const inboxContainer =
    document.getElementById(
        "inbox-list-container"
    );

const chatContainer =
    document.getElementById(
        "chat-history-container"
    );

const sendButton =
    document.getElementById(
        "btn-send-message"
    );

const chatInput =
    document.getElementById(
        "chat-input"
    );

// STATE

let conversations = [];

let activeConversation = null;

// FETCH CONVERSATIONS

async function fetchConversations(){

    const response =
        await apiRequest(
            "/messages/conversations"
        );

    if(!response){
        return;
    }

    conversations =
        response.conversations;

    renderInbox();
}

// RENDER INBOX

function renderInbox(){

    inboxContainer.innerHTML = "";

    conversations.forEach(conversation => {

        const initials =
            getInitials(
                conversation.firstName,
                conversation.lastName
            );

        inboxContainer.innerHTML += `

            <div
                class="inbox-item"
                onclick="openConversation(
                    '${conversation._id}'
                )"
            >

                <div class="c-avatar">
                    ${initials}
                </div>

                <div>

                    <strong>
                        ${conversation.firstName}
                        ${conversation.lastName}
                    </strong>

                    <p>
                        ${conversation.lastMessage}
                    </p>

                </div>

            </div>
        `;
    });
}

// OPEN CHAT

async function openConversation(id){

    activeConversation = id;

    const response =
        await apiRequest(
            `/messages/${id}`
        );

    if(!response){
        return;
    }

    renderMessages(response.messages);
}

// RENDER CHAT

function renderMessages(messages){

    chatContainer.innerHTML = "";

    messages.forEach(message => {

        const type =
            message.sender === "therapist"
            ? "outgoing"
            : "incoming";

        chatContainer.innerHTML += `

            <div class="bubble ${type}">

                <p>
                    ${message.text}
                </p>

                <span>
                    ${formatTime(
                        message.createdAt
                    )}
                </span>

            </div>
        `;
    });
}

// SEND MESSAGE

sendButton.addEventListener(
    "click",
    sendMessage
);

chatInput.addEventListener(
    "keypress",
    function(event){

        if(event.key === "Enter"){
            sendMessage();
        }
    }
);

async function sendMessage(){

    const text =
        chatInput.value.trim();

    if(!text || !activeConversation){
        return;
    }

    const response =
        await apiRequest(
            "/messages/send",
            "POST",
            {
                conversationId:
                    activeConversation,

                text
            }
        );

    if(response){

        chatInput.value = "";

        openConversation(
            activeConversation
        );
    }
}

// INIT

fetchConversations();