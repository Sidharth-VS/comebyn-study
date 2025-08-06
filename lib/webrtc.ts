const openMediaDevices = async (constraints: MediaStreamConstraints) => {
    return await navigator.mediaDevices.getUserMedia(constraints);
}

export function getMedia(){
    try{
        const stream = openMediaDevices({'video':false, 'audio':true});
        console.log("Got Media:", stream);
    }catch(error){
        console.log("Failed to get media");
    }
}    