
$(document).ready(() => {
    function displayError(error){
        const $err = $(`<span id="comments__login-err">${error}</span>`);
        $('#main__comments').prepend($err);
    }

    function displayComment(prev_comment){
        const new_comment = $(`<td class="comments">${prev_comment}</td>`);
        $('#lists__comment').append(new_comment);
    }

    const params = (new URL(location.href)).searchParams;
    const video_id = params.get('id');

    axios.get(`/video/info?id=${video_id}`)
        .then((res) => {
            const {name, video_name, videos} = res.data;
            const $video = $(`
                <video controls id="main__video">
                    <source src="/video/single-video?id=${video_id}" type="video/mp4">
                </video>
            `);
            $('main').prepend($video);
            $('#video-info__titile').text(`${video_name}`);
            $('#video-info__user').text(`Uploaded by ${name}`);
            $('#comments__num').text(`${videos} comments`);
        })
        .catch((err) => {
            console.error(err);
        });

    axios.get(`/video/comment?commenter=${video_id}`)
        .then((res) => {
            console.log(res);
            const {data} = res;
            data.forEach(prev_comment => {
                displayComment(prev_comment.comment);
            });
        })
        .catch((err) => {
            console.error(err);
        });

   

    let comment = "";

    $('#comments__add-comment').keypress((e) => {
        //console.log(e.originalEvent.key);
        if(e.keyCode == 13){
            //console.log(comment);
            axios({
                method: 'put',
                url: '/video/new-comment',
                data: {
                    comment,
                    video_id,
                }
            })
                .then((res) => {
                    console.log(res.data.error);
                    const {error} = res.data;
                    if(error){
                        console.log('ee');
                        displayError(error);
                    }
                    else{
                        console.log(comment);
                        displayComment(comment); 
                    }
                })
                .catch((err) => {
                    console.error(err);
                })
        }
        else{
            comment += e.originalEvent.key;
        }
    })
})
