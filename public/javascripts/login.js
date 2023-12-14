window.onload = (event) => {
    $('#cpubtn').unbind('click');
    let code = (Math.random() + 1).toString(36).substring(7);
    $('#code').val(code)
    if (/^\w{5,12}$/.test(code)) {
      send({
        'cmd': 'status',
        'lobby': code
      }); // Request status of currently typed lobby
    }
};