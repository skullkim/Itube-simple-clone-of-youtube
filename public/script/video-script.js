
const params = (new URL(location.href)).searchParams;
const video_id = params.get('id');
console.log(video_id);

axios.get(`/video/info?id=${video_id}`)
    .then((res) => {
        console.log(res);
        const {name, video_name} = res.data;
        const $video = $(`
            <video controls id="main__video">
                <source src="/video/single-video?id=${video_id}" type="video/mp4">
            </video>
            <div id="main__video-info">
                <span id="video-info__titile">${video_name}</span>
                <span id="video-info__user">Uploaded by ${name}</span>
            </div>
        `);
        $('main').append($video);
    })
    .catch((err) => {
        console.error(err);
    });