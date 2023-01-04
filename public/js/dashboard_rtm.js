let handleMemberJoined = async (MemberId) => {
    addMemberToDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addBotMessageToDom(`Welcome to the room ${name}! 👋`)
}

let addMemberToDom = async (MemberId) => {
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])

    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

let updateMemberTotal = async (members) => {
    let total = document.getElementById('members__count')
    total.innerText = members.length
}
 
let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId)

    let members = await channel.getMembers()
    updateMemberTotal(members)
}

let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`)
    let name = memberWrapper.getElementsByClassName('member_name')[0].textContent
    addBotMessageToDom(`${name} has left the room.`)
        
    memberWrapper.remove()
}

let getMembers = async () => {
    let members = await channel.getMembers()
    updateMemberTotal(members)
    for (let i = 0; members.length > i; i++){
        addMemberToDom(members[i])
    }
}

let handleEmtionChanelMessage = async (message, peerId) =>
{
    array = JSON.parse(message['text'])
    box = array[2]
    score = array [1]
    emotion = array[0]
    videoContainerPlayerDiv = document.getElementById(`user-${peerId}`)
    if (videoContainerPlayerDiv){
        agoraVideoDiv = videoContainerPlayerDiv.children
        if(agoraVideoDiv.length > 0){
            videoAgora =agoraVideoDiv[0].children
            if(videoAgora.length > 0 ){
                let canvas;
                video = videoAgora[0]
                if ( video.readyState === 4 ) {
                if(videoAgora.length < 2)
                {
                    canvas = faceapi.createCanvasFromMedia(video)
                    agoraVideoDiv[0].append(canvas)     
                }
                else
                {
                    canvas = videoAgora[1] 
                }
                let displaySize = {}
                displaySize["width"] = videoContainerPlayerDiv.clientWidth
                displaySize["height"] = videoContainerPlayerDiv.clientHeight
                faceapi.matchDimensions(canvas, displaySize)
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                
                context = canvas.getContext("2d");
                context.beginPath()
                context.strokeStyle = "blue";
                context.lineWidth = 2;
                context.font = "20px Arial";
                context.strokeText(emotion, 55, 55);
                box['_x'] = box['_x'] * (displaySize["width"]/300)
                box['_y'] = box['_y'] * (displaySize["height"]/300)
                box['_width'] = box['_width'] * (displaySize["width"]/300)
                box['_height'] = box['_height'] * (displaySize["height"]/300)
                // console.log(displaySize)
                // console.log(box)
                context.strokeRect(box['_x'],box['_y'],box['_width'],box['_height']);
            }
        }
        }
    }
}

let handleEmtionMessage = async (message, peerId, messageProps) =>
{
    array = JSON.parse(message['text'])
    box = array[2]
    score = array [1]
    emotion = array[0]
    videoContainerPlayerDiv = document.getElementById(`user-${peerId}`)
    if (videoContainerPlayerDiv){
        agoraVideoDiv = videoContainerPlayerDiv.children
        if(agoraVideoDiv.length > 0){
            videoAgora =agoraVideoDiv[0].children
            if(videoAgora.length > 0 ){
                let canvas;
                video = videoAgora[0]
                if ( video.readyState === 4 ) {
                if(videoAgora.length < 2)
                {
                    canvas = faceapi.createCanvasFromMedia(video)
                    agoraVideoDiv[0].append(canvas)     
                }
                else
                {
                    canvas = videoAgora[1] 
                }
                let displaySize = {}
                displaySize["width"] = videoContainerPlayerDiv.clientWidth
                displaySize["height"] = videoContainerPlayerDiv.clientHeight
                faceapi.matchDimensions(canvas, displaySize)
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                
                context = canvas.getContext("2d");
                context.beginPath()
                context.strokeStyle = "blue";
                context.lineWidth = 2;
                context.font = "20px Arial";
                context.strokeText(emotion, 55, 55);
                box['_x'] = box['_x'] * (displaySize["width"]/300)
                box['_y'] = box['_y'] * (displaySize["height"]/300)
                box['_width'] = box['_width'] * (displaySize["width"]/300)
                box['_height'] = box['_height'] * (displaySize["height"]/300)
                // console.log(displaySize)
                // console.log(box)
                context.strokeRect(box['_x'],box['_y'],box['_width'],box['_height']);
            }
        }
        }
    }
}
let handleChannelMessage = async (messageData, MemberId) => {
    let data = JSON.parse(messageData.text)
    if(data.type === 'chat'){
        addMessageToDom(data.displayName, data.message)
    }

    if(data.type === 'user_left'){
        let item = document.getElementById(`user-container-${data.uid}`)
        if (item){
            item.remove()
        }

        if(userIdInDisplayFrame === `user-container-${data.uid}`){
            displayFrame.style.display = null
            userIdInDisplayFrame = null
            for(let i = 0; videoFrames.length > i; i++){
                videoFrames[i].style.height = '300px'
                videoFrames[i].style.width = '300px'
            }
        }
    }
}

let sendMessage = async (e) => {
    e.preventDefault()

    let message = e.target.message.value
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName})})
    addMessageToDom(displayName, message)
    e.target.reset()
}





let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}


let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages')

    let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 EDSS</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`

    messagesWrapper.insertAdjacentHTML('beforeend', newMessage)

    let lastMessage = document.querySelector('#messages .message__wrapper:last-child')
    if(lastMessage){
        lastMessage.scrollIntoView()
    }
}

let leaveChannel = async () => {
    await channel.leave()
    await rtmClient.logout()
}

window.addEventListener('beforeunload', leaveChannel)
let messageForm = document.getElementById('message__form')
messageForm.addEventListener('submit', sendMessage)