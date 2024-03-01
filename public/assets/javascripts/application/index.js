$(function() {
	$("#network").on('change', (event) => {
		let networkType = $(event.target).val();
		$("#requestTokens").text(`Request 1 ${networkType}`);
		$("#network-type").val(networkType);
	})

	var loader = $(".loading-container");
	$( "#faucetForm" ).submit(function( e ) {
		e.preventDefault();
		$this = $(this);
		loader.removeClass("hidden");
		var receiver = $("#receiver").val();
		$.ajax({
			url:"/",
			type:"POST",
			data: $this.serialize()
		}).done(function(data) {
			grecaptcha.reset();
			if (!data.success) {
				loader.addClass("hidden");
				console.log(data)
				console.log(data.error)
				swal("Error", data.error.message, "error");
				return;
			}

			$("#receiver").val('');
			loader.addClass("hidden");
			swal("Success",
				`1 ESC has been successfully transferred to <a href="https://esc-testnet.elastos.io/tx/${data.success.txHash}" target="blank">${receiver}`,
				"success"
			);
		}).fail(function(err) {
			grecaptcha.reset();
			console.log(err);
			loader.addClass("hidden");
		});
	});
});
