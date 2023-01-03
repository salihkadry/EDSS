const APP_ID = "0dad2ddcc43146dca3260bfaaca6e7d0"
let joinedStream =false;

AgoraRTC.setLogLevel(3)


let client;
let rtmClient;
let channel;
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')
let displayName = urlParams.get('name')
if(!displayName || !roomId){
    window.location = '/'
}
let uid = roomId+'547180838'
sessionStorage.setItem('uid', uid)
let localTracks = []
let remoteUsers = {}

let localScreenTracks;
let sharingScreen = false;


let RTMtoken = null
let RTCtoken = null


let joinRoomInit = async () => {
    //chat room

    rtmClient = await AgoraRTM.createInstance(APP_ID , {'logFilter' :AgoraRTM.LOG_FILTER_ERROR })
    
    await rtmClient.login({uid,RTMtoken})
    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})
    channel = await rtmClient.createChannel(roomId)
    await channel.join()
    channel.on('MemberJoined', handleMemberJoined)
    channel.on('MemberLeft', handleMemberLeft)
    channel.on('ChannelMessage', handleChannelMessage)
    rtmClient.on('MessageFromPeer',handleEmtionMessage)
    getMembers()
    addBotMessageToDom(`Welcome to the room ${displayName}! 👋`)
    //video audio room 
    client = await AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, RTCtoken, uid)
    client.on('user-left', handleUserLeft)
    client.on('user-published', handleUserPublished)
}


let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    
    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.uid}`)
    if(player === null){
        player = `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
            </div>`

        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)
   
    }

    if(displayFrame.style.display){
        let videoFrame = document.getElementById(`user-container-${user.uid}`)
        videoFrame.style.height = '100px'
        videoFrame.style.width = '100px'
    }

    if(mediaType === 'video'){
        user.videoTrack.play(`user-${user.uid}`)
    }

    if(mediaType === 'audio'){
        user.audioTrack.play()
    }
    
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    let item = document.getElementById(`user-container-${user.uid}`)
    if(item){
        item.remove()
    }

    if(userIdInDisplayFrame === `user-container-${user.uid}`){
        displayFrame.style.display = null
        userIdInDisplayFrame = null
        let videoFrames = document.getElementsByClassName('video__container')
        for(let i = 0; videoFrames.length > i; i++){
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }
}

getTokens = async ()=>
{
    res =await fetch(`http://localhost:8080/rte/${roomId}/publisher/uid/${uid}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    JasonObj = await res.json()
    RTCtoken = JasonObj['rtcToken'];
    RTMtoken = JasonObj['rtmToken'];
    
}



//{ 'rtcToken': rtcToken, 'rtmToken': rtmToken }
getTokens().then(async ()=>
{
    await joinRoomInit()
    client.on("token-privilege-will-expire" , async function ()
    {
        await getTokens()
        await client.renewToken(RTCtoken);
        await rtmClient.renewToken(RTMtoken);
    }); 
})

