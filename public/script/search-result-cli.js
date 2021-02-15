
const param = (new URL(location.href)).searchParams;
const search = param.get('search');
if(search){
    axios.get(`/video/search-result?search=${search}`)
        .then((res) => {
            const {data} = res;
            console.log(data);
            if(data.length){
                data.forEach(video => {
                    const {id, video_name} = video;
                    const $div = $(`
                        <a href="/video/single-video-page?id=${id}" id="main__video">
                            <img src="/video/sumnail?id=${id}" class="video__sumnail">
                            ${video_name}
                        </a>
                    `);
                    $('#main').append($div);
                });
            }
            else{
                const $span = $(`<span id="main__no-result">No result</span>`);
                $('#main').append($span);
            }
        })
        .catch((err) => {
            console.error(err);
        });
}