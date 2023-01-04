const APP_ID = "0dad2ddcc43146dca3260bfaaca6e7d0"
let joinedStream =false;
let uid = (Math.floor(Math.random() * 10000)).toString()
sessionStorage.setItem('uid', uid)
AgoraRTC.setLogLevel(3)


let client;
let rtmClient;
let channel;
let Monitorchannel;
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')
let displayName = urlParams.get('name')
if(!displayName || !roomId){
    window.location = '/'
}
let localTracks = []
let remoteUsers = {}

let localScreenTracks;
let sharingScreen = false;


let RTMtoken = null
let RTCtoken = null


let joinRoomInit = async () => {
    rtmClient = await AgoraRTM.createInstance(APP_ID , {'logFilter' :AgoraRTM.LOG_FILTER_ERROR })
    
    await rtmClient.login({uid,RTMtoken})
    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})
    channel = await rtmClient.createChannel(roomId)
    Monitorchannel = await rtmClient.createChannel(roomId+'547180838')
    await channel.join()
    await Monitorchannel.join()
    channel.on('MemberJoined', handleMemberJoined)
    channel.on('MemberLeft', handleMemberLeft)
    channel.on('ChannelMessage', handleChannelMessage)
    getMembers()
    addBotMessageToDom(`Welcome to the room ${displayName}! 👋`)
    //video audio room 
    client = await AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    
    await client.join(APP_ID, roomId, RTCtoken, uid)
    document.getElementById('join-btn').addEventListener('click', joinStream)
}

let joinStream = async () => {
    document.getElementById('join-btn').style.display = 'none'
    

    // localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {encoderConfig:{
    //     width:{min:640, ideal:1920, max:1920},
    //     height:{min:480, ideal:1080, max:1080}
    // }})

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)
    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[0],localTracks[1]])
    document.getElementsByClassName('stream__actions')[0].style.display = 'flex'
}

userDetectionInterval = {}
IntervalId = setInterval(async ()=>{

    videoContainerPlayerDiv = document.getElementById(`user-${uid}`)
    if (videoContainerPlayerDiv){
    agoraVideoDiv = videoContainerPlayerDiv.children
        if(agoraVideoDiv.length > 0){
            videoAgora =agoraVideoDiv[0].children
        if(videoAgora.length > 0){
            video = videoAgora[0]
            detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
            if (detections){
                emotions = 
                        {'angry':detections.expressions.angry,
                        'disgusted':detections.expressions.disgusted,
                        'fearful':detections.expressions.fearful,
                        'neutral':detections.expressions.neutral,
                        'sad':detections.expressions.sad,
                        'surprised':detections.expressions.surprised,
                        'happy':detections.expressions.happy}
                        maxEmotionKey = Object.keys(emotions).reduce(function(a, b){ return emotions[a] > emotions[b] ? a : b });

                let displaySize = { width: 300, height: 300 } 
                const resizedDetections = await faceapi.resizeResults(detections, displaySize)
                var message = [maxEmotionKey , ((emotions[maxEmotionKey]*100) | 0) , resizedDetections.detection._box]
                //sendEmotionMessage(JSON.stringify(message) , rtmClient , roomId)
                sendEmotionMessageChanel(JSON.stringify(message) , Monitorchannel)
            } 
        }
    }
    }


},100)







let toggleMic = async (e) => {
    let button = e.currentTarget

    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[0].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleCamera = async (e) => {
    let button = e.currentTarget

    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleScreen = async (e) => {
    let screenButton = e.currentTarget
    let cameraButton = document.getElementById('camera-btn')
    let leaveButton = document.getElementById('leave-btn')
    if(!sharingScreen){
        

        
        try {
        localScreenTracks = await AgoraRTC.createScreenVideoTrack()
        
        }catch (e)
        {
            return;
        }
        sharingScreen = true
        screenButton.classList.add('active')
        cameraButton.classList.remove('active')
        cameraButton.style.display = 'none'
        leaveButton.style.display = 'none'
        document.getElementById(`user-container-${uid}`).remove()
        displayFrame.style.display = 'block'

        let player = `<div class="video__container" id="user-container-${uid}">
                <div class="video-player" id="user-${uid}"></div>
            </div>`

        displayFrame.insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)

        userIdInDisplayFrame = `user-container-${uid}`
        localScreenTracks.play(`user-${uid}`)

        await client.unpublish([localTracks[1]])
        await client.publish([localScreenTracks])

        let videoFrames = document.getElementsByClassName('video__container')
        for(let i = 0; videoFrames.length > i; i++){
            if(videoFrames[i].id != userIdInDisplayFrame){
              videoFrames[i].style.height = '100px'
              videoFrames[i].style.width = '100px'
            }
          }


    }else{
        sharingScreen = false 
        cameraButton.style.display = 'block'
        leaveButton.style.display = 'block'
        document.getElementById(`user-container-${uid}`).remove()
        await client.unpublish([localScreenTracks])

        let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`
        displayFrame.insertAdjacentHTML('beforeend', player)
        displayFrame.style.display = 'block'
        await localTracks[0].setMuted(true)
        await localTracks[1].setMuted(true)

        document.getElementById('mic-btn').classList.remove('active')
        document.getElementById('screen-btn').classList.remove('active')

        localTracks[1].play(`user-${uid}`)
        await client.publish([localTracks[1]])
    }
}

let leaveStream = async (e) => {
    e.preventDefault()

    document.getElementById('join-btn').style.display = 'block'
    document.getElementsByClassName('stream__actions')[0].style.display = 'none'

    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.unpublish([localTracks[0], localTracks[1]])

    if(localScreenTracks){
        await client.unpublish([localScreenTracks])
    }
    document.getElementById(`user-container-${uid}`).remove()

    if(userIdInDisplayFrame === `user-container-${uid}`){
        displayFrame.style.display = null
        let videoFrames = document.getElementsByClassName('video__container')

        for(let i = 0; videoFrames.length > i; i++){
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }
    channel.sendMessage({text:JSON.stringify({'type':'user_left', 'uid':uid})})
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
    document.getElementById('camera-btn').addEventListener('click', toggleCamera)
    document.getElementById('mic-btn').addEventListener('click', toggleMic)
    document.getElementById('screen-btn').addEventListener('click', toggleScreen)
    document.getElementById('leave-btn').addEventListener('click', leaveStream)
    client.on("token-privilege-will-expire" , async function ()
    {
        await getTokens()
        await client.renewToken(RTCtoken);
        await rtmClient.renewToken(RTMtoken);
    }); 
})

