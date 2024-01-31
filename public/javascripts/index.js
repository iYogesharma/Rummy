/*
 * Functions for the Lobby/Index Page
 */

let joinGame = () => { // Joins/Creates regular game
  window.location.href = "/game/join/" + $('#code').val();
};

let joinCPU = () => { // Creates CPU game
  window.location.href = "/game/joincpu/" + $('#code').val();
};


handle.status = (data) => { // Handle getting the status of a lobby
  if (data.cmd == 'status') {
    if (data.status == 'waiting') {
      $('#lobbybtn').attr('class', 'btn btn-success');
      $('#lobbybtn').html('Join');
      $('#lobbybtn').on('click', () => joinGame());
    } else if (data.status == 'closed') {
      $('#lobbybtn').attr('class', 'btn btn-danger');
      $('#lobbybtn').html('Full');
    } else if (data.status == 'open') {
      $('#lobbybtn').attr('class', 'btn btn-info');
      $('#cpubtn').css({ display: 'inline' });
      $('#lobbybtn').html('Create');
      $('#lobbybtn').on('click', () => joinGame());
      $('#cpubtn').on('click', () => joinCPU());
    }else if (data.status == 'guest') {
      $('#cpubtn').on('click', () => joinCPU());
    }
  }

};

$('#code').on('keyup', () => { // As the user types...

  $('#lobbybtn').unbind('click');
  $('#cpubtn').unbind('click');

  $('#cpubtn').css({ display: 'none' });

  let code = $('#code').val().replace(/\W/, ''); // Replace invalid chars

  $('#code').val(code);

  if (/^\w{5,12}$/.test(code)) {

    $('#lobbybtn').attr('class', 'btn btn-default');
    $('#lobbybtn').html('....');
    $('#lobbybtn').on('click', () => {});

    send({
      'cmd': 'status',
      'lobby': code
    }); // Request status of currently typed lobby

  } else {

    $('#lobbybtn').attr('class', 'btn btn-danger');
    $('#lobbybtn').html('Invalid');
    $('#lobbybtn').on('click', () => {});

  }

});

$(document).on('click', '#withdraw', function(e){
  e.preventDefault();
  $.ajax({
    type: 'GET',
    url: '/v1/withdraw',
    success: function({data}){
      if( data.href ){
        $('#WithdrawQrHref').attr('href', data.href);
        $('#WithdrawQrCode').attr('src', data.dataUri)
        $('#WithdrawQrHrefAction').attr('href', data.href);
        $('#withdrawalModal').modal('show')
      }
    }
  })
})

$(document).on('click', '#deposite', function(e){
  e.preventDefault();
  $('#depositeModal').modal({backdrop: 'static', keyboard: false},'show')
})

var invoice = null;reload = false;
$(document).on('click', '#DepositeQrHrefAction', function(e){
  e.preventDefault();
  const amount =$('#amount-input').val();
  if( !amount){
    alert('Please enter amount to be deposited')
  } else {
    $.ajax({
      type: 'GET',
      url: '/v1/deposite',
      data:{amount:amount},
      success: function({data}){
        if( data.href ){
          invoice =  data.invoice
          $('#DepositeQrHref').attr('href', data.href);
          $('#DepositeQrCode').attr('src', data.dataUri)
          $('.hide-amount-input').hide();
          $('#DepositeQrHrefAction').hide()
          $('#DepositeQrHref').show();
        }
      }
    })
  }

})

$(document).on('click', '#DepositeQrHref', function(e){
  reload = true;
})

$(document).on('click', '#manualInvoice', function(e){
  $('#manualInputDiv').show()
})
$("#depositeModal").on("hidden.bs.modal", function () {
  if(invoice){
    $.ajax({
      type: 'POST',
      url: '/v1/invoiceUpdates',
      data:{pr:invoice},
      success: function(data){
        
        if(data.setteled) {
          $('#successModal').modal({backdrop: 'static', keyboard: false},'show')
        }
        if(reload) {
          window.location.reload();
        }
      } ,
      error : function(err) {
        console.log(err) 
        if(reload) {
          window.location.reload();
        }
        // $('#errorModal').modal('show')
        // $('#failureMessage').html(err.message)
      }
    })
  }
  
 
});
$("#withdrawalModal").on("hidden.bs.modal", function () {
  window.location.reload();
});

$(document).on("click", "#successContinue",function (e) {
  window.location.reload();
});




/**
 * @event scannerDetection
 * Scanner detection script
 **/
$(document).scannerDetection({
  timeBeforeScanTest: 200, // wait for the next character for upto 200ms
  avgTimeByChar: 100, // it's not a barcode if a character takes longer than 100ms
  onComplete: function(barcode, qty){
    if(barcode == "okqlty"){
     alert('here')
    }else if(barcode == "reject"){
      alert('here')
    }
  }
});


$(document).on('click', '#WithdrawInvoice', function(){
  const invoice = $('#customInvoice').val();
  if( invoice ) {
    $.ajax({
      type: 'POST',
      url: '/v1/withdrawInvoice',
      data:{invoice:invoice},
      success: function(data){
        if(data.setteled) {
          $('#withdrawalModal').modal('hide')
          $('#successModal').modal({backdrop: 'static', keyboard: false},'show')
        }
      } ,
      error : function(err) {
        // console.log(err) 
        $('#withdrawalModal').modal('hide')
        $('#errorModal').modal('show')
        $('#failureMessage').html(err.message)
      }
    })
  } else {
    alert('Please Add Invoice First');
  }
}) 

var events;
let createEvents = () => {
  // Close connection if open
  if(events){
    events.close();
  }
  // Establishing an SSE connection
  events = new EventSource('/events');
  events.onmessage = (event) => {
    console.log(event)
        // If the component is mounted, we set the state
        // of the list with the received data
        if(event.data){
           let data = JSON.parse(event.data);
           if( data.cmd == 'paymentSuccessfull'){
              paymentSuccessfull();
           }
          
        }
  };
  // If an error occurs, we wait a second
  // and call the connection function again
  events.onerror = (err) => {
        timer = setTimeout(() => {
           createEvents();
        }, 1000);
  };
};

$(document).ready( function(){
  createEvents();
})

let paymentSuccessfull = (data) => { // Handle getting the status of a lobby
  $('#successModal').modal({backdrop: 'static', keyboard: false},'show')
};


handle.paymentSuccessfull = (data) => { // Handle getting the status of a lobby
  $('#successModal').modal({backdrop: 'static', keyboard: false},'show')
};



