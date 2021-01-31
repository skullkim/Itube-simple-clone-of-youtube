window.onload = () => {
    axios({
        method: 'get',
        url: '/login/profile-name',
        data: {}
    })
        .then(res => {
            const {name} = res.data;
            console.log(name);
            $('#profile__name').text(name);
        })
        .catch(err => {
            console.error(err);
        })
}