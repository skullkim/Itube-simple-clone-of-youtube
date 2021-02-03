window.onload = () => {
    const param = (new URL(location.href)).searchParams('error');
    const error_param = param.get('error');
    if(error_param){
        alert(error_param);
    }
}