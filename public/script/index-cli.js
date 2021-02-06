window.onload = () => {
    const param = (new URL(location.href)).searchParams;
    const error_param = param.get('error');
    if(error_param){
        alert(error_param);
    }

    axios.get('/video/uploaded-video')
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.error(err);
        })

}