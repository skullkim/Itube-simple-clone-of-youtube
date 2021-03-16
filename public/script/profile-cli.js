//window.onload = () => {


axios({
    method: 'get',
    url: '/login/profile-name',
    data: {}
})
    .then(res => {
        const {name, login_as} = res.data;
        console.log(login_as);
        $('#profile__name').text(name);
    })
    .catch(err => {
        console.error(err);
    });


const param = (new URL(location.href)).searchParams;
const error_param = param.get('error');
if(error_param){
    alert(error_param);
}
//}