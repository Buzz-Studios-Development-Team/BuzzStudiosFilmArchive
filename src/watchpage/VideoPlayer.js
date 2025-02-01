export default function VideoPlayer(props) {
    return (
        <video ref={props.videoRef} crossOrigin='anonymous' playsInline controls controlsList="nodownload" class="player">
            <source src={props.url}/>
            <track
                label="English"
                kind="subtitles"
                srcLang="en"
                src={props.captionsURL}
            />
        </video>
    )
}