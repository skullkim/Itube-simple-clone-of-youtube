let search_str = "";

$('#header__search').keydown((e) => {
    const {key} = e.originalEvent;
    console.log($('#header__search').val());
    if(key === 'Enter'){
        const search_str = $('#header__search').val();
        location.href = `/video/search?search=${search_str}`;
    }
})