$(function() {
	const networkExplorerMap = {
		'ESC': 'https://esc-testnet.elastos.io/tx/',
		'EID': 'https://eid-testnet.elastos.io/tx/',
	}

	let networkType = 'ELA';
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	let network = urlParams.get('chain');
	if(network === "esc") {
		networkType = 'ESC'
	} else if(network === 'eid') {
		networkType = 'EID'
	}
	$("#requestTokens").text(`Request 1 ${networkType}`);

	let networkSelector = $("#network");
	networkSelector.val(networkType);
	$("#network-type").val(networkType);

	networkSelector.on('change', (event) => {
		networkType = $(event.target).val();
		$("#requestTokens").text(`Request 1 ${networkType}`);
		$("#network-type").val(networkType);

		$("#receiver").trigger('input');
	})

	$("#receiver").on('input', () => {
		let warn = $("#address-warn");
		let inputValue = $("#receiver").val();
		let button = $("#requestTokens");
		if(inputValue === "") {
			!warn.attr('hidden') && warn.attr('hidden', 'hidden');
			return;
		}

		if(networkType === 'ELA') {
			if(!inputValue.startsWith('E') || inputValue.length !== 34) {
				button.prop('disabled', true);
				warn.removeAttr("hidden");
				return;
			}
		} else {
			if(!inputValue.startsWith('0x') || inputValue.length !== 42) {
				button.prop('disabled', true);
				warn.removeAttr("hidden");
				return;
			}
		}

		warn.attr('hidden', 'hidden');
		button.removeAttr('disabled');
	})

	var loader = $(".loading-container");
	$("#faucetForm" ).submit(function( e ) {
		e.preventDefault();
		var receiver = $("#receiver").val();
		if(!receiver) {
			swal("Error", "Please input your address", "error");
			return;
		}
		if(!grecaptcha || grecaptcha.getResponse().length <= 0) {
			swal("Error", "Please verify that you are not a robot", "error");
			return;
		}

		$this = $(this);
		loader.removeClass("hidden");
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
			$("#requestTokens").prop('disabled', true);
			loader.addClass("hidden");
			swal("Success",
				networkType === 'ELA' ? `1 ELA has been send to ${receiver}, Please check in a few minutes.`
					: `1 ${networkType} has been successfully transferred to <a href="${networkExplorerMap[networkType]}${data.success.txHash}" target="blank">${receiver}`,
				"success"
			);
		}).fail(function(err) {
			grecaptcha.reset();
			console.log(err);
			loader.addClass("hidden");
		});
	});
});
