/* ============================================================
   ELEMENTS
============================================================ */

const chatContainer =
    document.getElementById("chatContainer");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");


/* ============================================================
   SEND MESSAGE
============================================================ */

async function sendMessage() {

    const message =
        messageInput.value.trim();


    if (!message) {

        return;

    }


    /* Show user message */

    addUserMessage(message);


    /* Clear input */

    messageInput.value = "";


    /* Show loading */

    const loadingMessage =
        addBotLoading();


    try {

        const response =
            await fetch("/api/chat", {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    message: message

                })

            });


        const data =
            await response.json();


        /* Remove loading */

        loadingMessage.remove();


        console.log(
            "SERVER RESPONSE:",
            data
        );


        if (!response.ok || !data.success) {

            addBotMessage(
                data.message ||
                "Sorry, something went wrong."
            );

            return;

        }


        /* =================================================
           IMPORTANT

           Backend returns:

           {
               message: "...",
               software_options: [...]
           }

        ================================================== */


        addBotResponse(data);


    }

    catch (error) {

        console.error(
            "API ERROR:",
            error
        );


        loadingMessage.remove();


        addBotMessage(
            "Unable to connect to the server. Please try again."
        );

    }

}


/* ============================================================
   USER MESSAGE
============================================================ */

function addUserMessage(message) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message user-message";


    wrapper.innerHTML = `

        <div class="message-content">

            <div class="message-name">
                You
            </div>

            <div class="user-bubble">
                ${escapeHtml(message)}
            </div>

        </div>

        <div class="avatar user-avatar">
            U
        </div>

    `;


    chatContainer.appendChild(wrapper);

    scrollToBottom();

}


/* ============================================================
   BOT MESSAGE
============================================================ */

function addBotMessage(message) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message bot-message";


    wrapper.innerHTML = `

        <div class="avatar bot-avatar">
            S
        </div>

        <div class="message-content">

            <div class="message-name">
                Software Assistant
            </div>

            <div class="message-bubble">

                ${formatMessage(message)}

            </div>

        </div>

    `;


    chatContainer.appendChild(wrapper);

    scrollToBottom();

}


/* ============================================================
   BOT LOADING
============================================================ */

function addBotLoading() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message bot-message";


    wrapper.innerHTML = `

        <div class="avatar bot-avatar">
            S
        </div>

        <div class="message-content">

            <div class="message-name">
                Software Assistant
            </div>

            <div class="message-bubble loading">

                Searching the SCCM software catalog...

            </div>

        </div>

    `;


    chatContainer.appendChild(wrapper);

    scrollToBottom();


    return wrapper;

}


/* ============================================================
   BOT RESPONSE
============================================================ */

function addBotResponse(data) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message bot-message";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const name =
        document.createElement("div");

    name.className =
        "message-name";

    name.textContent =
        "Software Assistant";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    /* ========================================================
       NORMAL MESSAGE
    ========================================================= */

    if (data.message) {

        const messageText =
            document.createElement("div");

        messageText.innerHTML =
            formatMessage(data.message);

        bubble.appendChild(
            messageText
        );

    }


    /* ========================================================
       SOFTWARE OPTIONS
    ========================================================= */

    const softwareOptions =
        data.software_options || [];


    if (
        Array.isArray(softwareOptions) &&
        softwareOptions.length > 0
    ) {

        createSoftwareSelection(
            bubble,
            softwareOptions
        );

    }


    content.appendChild(name);

    content.appendChild(bubble);


    wrapper.innerHTML = `

        <div class="avatar bot-avatar">
            S
        </div>

    `;


    wrapper.appendChild(content);

    chatContainer.appendChild(wrapper);

    scrollToBottom();

}


/* ============================================================
   CREATE SOFTWARE SELECTION
============================================================ */

function createSoftwareSelection(
    parent,
    softwareOptions
) {


    const selection =
        document.createElement("div");

    selection.className =
        "software-selection";


    /* Title */

    const title =
        document.createElement("div");

    title.className =
        "selection-title";

    title.textContent =
        "Select the software you would like to request:";


    selection.appendChild(title);


    /* ========================================================
       SOFTWARE OPTIONS
    ========================================================= */

    softwareOptions.forEach(
        (software, index) => {

            const option =
                document.createElement("label");

            option.className =
                "software-option";


            const radio =
                document.createElement("input");

            radio.type =
                "radio";

            radio.name =
                "softwareSelection";

            radio.value =
                software.software_name;

            radio.id =
                "software-" + index;


            /* Software text */

            const textContainer =
                document.createElement("div");


            const softwareName =
                document.createElement("div");

            softwareName.className =
                "software-name";

            softwareName.textContent =
                software.software_name;


            const description =
                document.createElement("div");

            description.className =
                "software-description";

            description.textContent =
                software.description ||
                "Available in the SCCM software catalog.";


            textContainer.appendChild(
                softwareName
            );

            textContainer.appendChild(
                description
            );


            option.appendChild(
                radio
            );

            option.appendChild(
                textContainer
            );


            /* Selection styling */

            radio.addEventListener(
                "change",
                function () {

                    document
                        .querySelectorAll(
                            ".software-option"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    option.classList.add(
                        "selected"
                    );

                }
            );


            selection.appendChild(
                option
            );

        }
    );


    /* ========================================================
       REQUEST PANEL
    ========================================================= */

    const requestPanel =
        document.createElement("div");

    requestPanel.className =
        "request-panel";


    requestPanel.innerHTML = `

        <label>
            Business Justification
        </label>

        <textarea
            id="businessJustification"
            class="justification"
            maxlength="500"
            placeholder="Please explain why you need this software..."
        ></textarea>

        <button
            class="primary-button"
            id="reviewButton">

            Review Request

        </button>

    `;


    selection.appendChild(
        requestPanel
    );


    parent.appendChild(
        selection
    );


    /* ========================================================
       REVIEW BUTTON
    ========================================================= */

    const reviewButton =
        requestPanel.querySelector(
            "#reviewButton"
        );


    reviewButton.addEventListener(
        "click",
        function () {

            reviewSoftwareRequest(
                selection,
                softwareOptions
            );

        }
    );

}


/* ============================================================
   REVIEW SOFTWARE REQUEST
============================================================ */

function reviewSoftwareRequest(
    selection,
    softwareOptions
) {


    const selected =
        selection.querySelector(
            'input[name="softwareSelection"]:checked'
        );


    if (!selected) {

        alert(
            "Please select a software."
        );

        return;

    }


    const justification =
        selection
            .querySelector(
                "#businessJustification"
            )
            .value
            .trim();


    if (!justification) {

        alert(
            "Please enter the business justification."
        );

        return;

    }


    if (justification.length < 10) {

        alert(
            "Please provide a little more detail in the business justification."
        );

        return;

    }


    const softwareName =
        selected.value;


    /* Disable original selection */

    selection
        .querySelectorAll(
            "input, textarea, button"
        )
        .forEach(
            element => {

                element.disabled =
                    true;

            }
        );


    /* ========================================================
       REVIEW CARD
    ========================================================= */

    const review =
        document.createElement("div");

    review.className =
        "request-panel";


    review.innerHTML = `

        <h3>
            Review Software Request
        </h3>

        <p>
            <strong>Software:</strong>
            ${escapeHtml(softwareName)}
        </p>

        <p>
            <strong>Business Justification:</strong>
        </p>

        <p>
            ${escapeHtml(justification)}
        </p>

        <button
            class="primary-button"
            id="confirmRequestButton">

            ✅ Confirm Software Request

        </button>

        <button
            class="secondary-button"
            id="cancelRequestButton">

            Cancel

        </button>

    `;


    selection.appendChild(
        review
    );


    /* ========================================================
       CONFIRM
    ========================================================= */

    review
        .querySelector(
            "#confirmRequestButton"
        )
        .addEventListener(
            "click",
            function () {

                confirmSoftwareRequest(
                    softwareName,
                    justification
                );

            }
        );


    /* ========================================================
       CANCEL
    ========================================================= */

    review
        .querySelector(
            "#cancelRequestButton"
        )
        .addEventListener(
            "click",
            function () {

                review.remove();


                selection
                    .querySelectorAll(
                        "input, textarea, button"
                    )
                    .forEach(
                        element => {

                            element.disabled =
                                false;

                        }
                    );

            }
        );

}


/* ============================================================
   CONFIRM REQUEST
============================================================ */

function confirmSoftwareRequest(
    softwareName,
    justification
) {


    console.log(
        "FINAL SOFTWARE REQUEST"
    );

    console.log(
        "Software:",
        softwareName
    );

    console.log(
        "Business Justification:",
        justification
    );


    /*
       IMPORTANT:

       For now this is only frontend.

       Later we will create:

       POST /api/software-request

       which will send:

       {
           software_name: "...",
           business_justification: "..."
       }

       to the Flask backend.

       The backend can then create
       the ServiceNow request.
    */


    addBotMessage(

        `Your request has been confirmed. ✅

Software: **${softwareName}**

Business Justification:
${justification}

Your request is ready for submission.`

    );

}


/* ============================================================
   FORMAT MESSAGE
============================================================ */

function formatMessage(message) {

    if (!message) {

        return "";

    }


    let formatted =
        escapeHtml(message);


    /* Bold */

    formatted =
        formatted.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /* New lines */

    formatted =
        formatted.replace(
            /\n/g,
            "<br>"
        );


    return formatted;

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* ============================================================
   SCROLL
============================================================ */

function scrollToBottom() {

    chatContainer.scrollTop =
        chatContainer.scrollHeight;

}


/* ============================================================
   ENTER KEY
============================================================ */

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* ============================================================
   SEND BUTTON
============================================================ */

sendButton.addEventListener(
    "click",
    sendMessage
);