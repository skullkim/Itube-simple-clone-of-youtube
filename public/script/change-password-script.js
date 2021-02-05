window.onload = () => {
    const param = (new URL(location.href)).searchParams;
    const error_param = param.get('error');
    const success_param = param.get('success');
    if(error_param){
        alert(error_param);
    }
    else if(success_param){
        alert(success_param);
    }
}