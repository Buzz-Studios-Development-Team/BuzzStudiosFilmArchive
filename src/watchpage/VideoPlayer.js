export function VideoPlayer(props)
{
    return (
        <>
            <video ref={props.VideoRef} crossOrigin='anonymous' playsInline controls controlsList="nodownload" class="player" contentType="video/mp4">
                <source src={props.VideoURL}/>
                {props.CaptionTracks !== undefined && props.CaptionTracks.length > 0 && props.CaptionTracks.map((track) => {
                return (
                    <track
                    default={track.code === "en"}
                    label={track.language}
                    key={track.code}
                    kind="subtitles"
                    srcLang={track.code}
                    src={track.url.url}
                    />
                )
                })}
            </video>
        </>
    )
}