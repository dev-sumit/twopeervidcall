	/***************************************************Video Call Below*******************************************************************/
	//Video element refernce
	let localPeerVideo = document.getElementById("localPeerVideo");
	let remotePeerVideo = document.getElementById("remotePeerVideo");

	/*Firebase Configuration below*/
	let firebaseConfig = {
	  apiKey: "AIzaSyAMmHdFBqPoxtjwSHi2OgTXh-PgMifHQ8g",
	  authDomain: "insanewebrtc.firebaseapp.com",
	  databaseURL: "https://insanewebrtc.firebaseio.com",
	  projectId: "insanewebrtc",
	  storageBucket: "insanewebrtc.appspot.com",
	  messagingSenderId: "270516699230",
	  appId: "1:270516699230:web:60ec77a159f6168cce74cf",
	  measurementId: "G-Q4KBN2KVJ5"
	};

	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);

	/*Firebase Configuration above*/

	/*STUN, TURN Servers below*/
	let servers = {
		'iceServers': [
			{'urls': 'stun:stun.services.mozilla.com'},
			{'urls': 'stun:stun.l.google.com:19302'},
			{'urls': 'turn:numb.viagenie.ca',
				'credential': 'vendetta@390',
				'username': 'sumitsumit1997@gmail.com'
			}
		]
	};

	/*STUN, TURN Servers above*/


	//Database Reference - reference the root location in the database
	let database = firebase.database().ref();


	//PeerConnection
	let pc = new RTCPeerConnection(servers);
	console.log("Peer Connection Created");

	//Local ID
	//let localId = Math.floor(Math.random()*1000000000);
	//let localid = "Cierra Vega"; //************
	let localid = "";
	/*
	let localid = "Thomas Crane";
	let localid = "Miranda Shaffer";
	*/

	/*Calling events below*/
	let callpickerid = ""; //Global variable to store id of whom we are calling

	function VideoCall(val){
        callpickerid = val;
		console.log(" Calling "+ callpickerid);
		showRemoteVideoInitiation();
	}

	/*Sender Side below*/



	//Send Signalling Message to Signalling Server
	function sendSDPMessage(msgtype,sender, callpickerid, data){
		
		let msg = database.push({
			msgtype:msgtype,
			sender: sender,
			pickerid: callpickerid,
			message: data
		});
		msg.remove();
	}

	function sendICEMessage(msgtype, sender, data){
		
		let msg = database.push({
			msgtype: msgtype,
			sender: sender,
			message: data
		});
		msg.remove();
	}


	//Sending ICE Candidates
	console.log("Sending ice candidates, after on ice event");
	pc.onicecandidate = (event => event.candidate ? 
		sendICEMessage("ICE",localid, JSON.stringify({'ice': event.candidate})):
		console.log("Sent All Ice Candidates, to call picker") );
		

	//Set Remote Video to remote video element
	pc.onaddstream = (event => remotePeerVideo.srcObject = event.stream);
	console.log("Added Remote Stream to Remote Video Element");


	//Get Local Video set it to local video element
	function showLocalVideo(yourId){
        
        localid = String(yourId);

		navigator.mediaDevices.getUserMedia({
			audio : true,
			video : true
		})
		.then(stream => localPeerVideo.srcObject = stream)
		.then(stream => pc.addStream(stream));
		console.log("Showing local media");
	}

	//
	function showRemoteVideoInitiation(){
		//creating offer from local peer to remote peer
		pc.createOffer()
		.then(offer => pc.setLocalDescription(offer))
		.then( () => sendSDPMessage("SDP",localid, callpickerid, JSON.stringify({'sdp' : pc.localDescription}) 
		));
		console.log("Created and sent sdp Offer On Signalling server to " + callpickerid);
	}

	/*Sender Side above*/

	/*Reciever Side below*/

	//read the signalling message, so we are the reciever now
	function readMessage(data){
		
		
		let msgtype = String(data.val().msgtype);

		if(msgtype == "ICE"){

			
			let msg = JSON.parse(data.val().message);
			
			let sender = String(data.val().sender);

			console.log("************"+msgtype+" Message Received****************");
			console.log("Sender: "+sender);
			console.log("Message"+JSON.stringify(msg));

			if(sender != localid){

				if(msg.ice != undefined){
						
						//If recieved ice candaidate add your ice candidates as reply for peer to peer connection
						pc.addIceCandidate(
							new RTCIceCandidate(msg.ice)
						);
						console.log("Recieved on ICE, Sent back add ICE");		
				}
			}
		}
		

		if(msgtype == "SDP"){

			
			let msg = JSON.parse(data.val().message);
			
			let sender = String(data.val().sender);
			
			let pickerid = String(data.val().pickerid);

			if(pickerid==localid){
						
				console.log("************"+msgtype+" Message Received****************");
				console.log("Sender: "+sender+", Receiver: "+pickerid);
				console.log("Message"+JSON.stringify(msg));
				
				//console.log("Received a call request from "+sender);
				
				if(msg.sdp.type == "offer"){
					
					//If recieved an offer from remote peer in database, create an answer
					
					
					pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
					.then(() => pc.createAnswer())
					.then(answer => pc.setLocalDescription(answer))
					.then(() => sendSDPMessage("SDP", localid, sender, JSON.stringify({'sdp': pc.localDescription})));
					console.log("Recieved offer from "+sender+", Sent back the sdp answer");
					
					
				}else if(msg.sdp.type == "answer"){
					
					pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
					console.log("Recieved answer from "+ sender+", sent last remote desc");
					
				}
			}
		}
	}
	database.on('child_added', readMessage);

	/*Reciever Side above*/


	/****Screen Sharing below***/
	function showScreenCaptureLocalVideo(){
		
		navigator.mediaDevices.getDisplayMedia()
		.then(stream => localPeerVideo.srcObject = stream)
		.then( stream => stream.getTracks().forEach(track => pc.addTrack(track, stream)))
		.catch(err => { console.error("Error:" + err); return null; });
		console.log("Screen Share Turned on");
		
	}

	function StartMyScreenCapture(){
		//Renegotiation after switching stream to screen sharing media
		pc.onnegotiationneeded = function (event) {
			showRemoteVideoInitiation();
			console.log("Renegotiation offer sent for switching stream, onnegotiationneeded fired");
		};
		
		showScreenCaptureLocalVideo();
		
	}

	function StopMyScreenCapture(){
		navigator.mediaDevices.getUserMedia({
			audio : true,
			video : true
		})
		.then(stream => localPeerVideo.srcObject = stream)
		.then(stream => pc.addStream(stream));
		console.log("Screen Share Turned off");
	}
	/****Screen Sharing above***/
	
	/***************************************************Video Call Below*******************************************************************/