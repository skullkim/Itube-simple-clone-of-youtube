
window.onload = () => {
    const param = (new URL(location.href)).searchParams;
    const error_param = param.get('error');
    if(error_param){
        alert(error_param);
    }

    axios.get('/video/uploaded-video')
        .then((res) => {
            const {data} = res;
            data.forEach(video => {
                const {id, video_name} = video;
                console.log(video, video_name);
                const $div = $(`
                    <a href="/video/sigle-video?id=${id}" id="main__video">
                        <img src="/video/sumnail?id=${id}" class="video__sumnail">
                        ${video_name}
                    </a>
                `);
                $('#main').append($div);
            });
            
        })
        .catch((err) => {
            console.error(err);
        })

}