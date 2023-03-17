import { decode } from "bolt11/payreq";

export const invoiceDecoder = {
	_bech32CharValues: 'qpzry9x8gf2tvdw0s3jn54khce6mua7l',

	decode: function (invoice) {
		const decoded = decode(invoice);
		const paymentRequest = decoded.paymentRequest;
		const input = paymentRequest.toLowerCase();
		const splitPosition = input.lastIndexOf('1');
		const humanReadablePart = input.substring(0, splitPosition);
		const decodeHumanReadablePart = this._decodeHumanReadablePart(humanReadablePart);
		const data = input.substring(splitPosition + 1, input.length - 6);
		const dataDecoded = this._decodeData(data);
		const tags = dataDecoded.tags;

		return {
			amount: decodeHumanReadablePart.amount,
			paymentHash: tags.find(item => item.type === "p").value,
			paymentSecret: tags.find(item => item.type === "s").value,
			expiry: tags.find(item => item.type === "x").value,
			timeStamp: dataDecoded.time_stamp,
		}
	},

	_decodeData: function (data) {
		let date32 = data.substring(0, 7);
		let dateEpoch = this._bech32ToInt(date32);
		let tagData = data.substring(7, data.length - 104);
		let decodedTags = this._decodeTags(tagData);

		return {
			'time_stamp': dateEpoch,
			'tags': decodedTags
		}
	},

	_decodeTags: function (tagData) {
		let tags = this._extractTags(tagData);
		let decodedTags = [];
		tags.forEach(value => decodedTags.push(this._decodeTag(value.type, value.length, value.data)));
		return decodedTags.filter(t => t !== undefined);
	},

	_decodeTag: function (type, length, data) {
		switch (type) {
			case 'p':
				if (length !== 52) break; // A reader MUST skip over a 'p' field that does not have data_length 52
				return {
					'type': type,
					'length': length,
					'description': 'payment_hash',
					'value': this._byteArrayToHexString(this._fiveBitArrayTo8BitArray(this._bech32ToFiveBitArray(data)))
				};
			case 's':
				if (length !== 52) break; // A reader MUST skip over a 's' field that does not have data_length 52
				return {
					'type': type,
					'length': length,
					'description': 'payment_secret',
					'value': this._byteArrayToHexString(this._fiveBitArrayTo8BitArray(this._bech32ToFiveBitArray(data)))
				};
			case 'd':
				return {
					'type': type,
					'length': length,
					'description': 'description',
					'value': this._bech32ToUTF8String(data)
				};
			case 'n':
				if (length !== 53) break; // A reader MUST skip over a 'n' field that does not have data_length 53
				return {
					'type': type,
					'length': length,
					'description': 'payee_public_key',
					'value': this._byteArrayToHexString(this._fiveBitArrayTo8BitArray(this._bech32ToFiveBitArray(data)))
				};
			case 'h':
				if (length !== 52) break; // A reader MUST skip over a 'h' field that does not have data_length 52
				return {
					'type': type,
					'length': length,
					'description': 'description_hash',
					'value': data
				};
			case 'x':
				return {
					'type': type,
					'length': length,
					'description': 'expiry',
					'value': this._bech32ToInt(data)
				};
			case 'c':
				return {
					'type': type,
					'length': length,
					'description': 'min_final_cltv_expiry',
					'value': this._bech32ToInt(data)
				};
			case 'f':
				let version = this._bech32ToFiveBitArray(data.charAt(0))[0];
				if (version < 0 || version > 18) break; // a reader MUST skip over an f field with unknown version.
				data = data.substring(1, data.length);
				return {
					'type': type,
					'length': length,
					'description': 'fallback_address',
					'value': {
						'version': version,
						'fallback_address': data
					}
				};
			case 'r':
				data = this._fiveBitArrayTo8BitArray(this._bech32ToFiveBitArray(data));
				let pubkey = data.slice(0, 33);
				let shortChannelId = data.slice(33, 41);
				let feeBaseMsat = data.slice(41, 45);
				let feeProportionalMillionths = data.slice(45, 49);
				let cltvExpiryDelta = data.slice(49, 51);
				return {
					'type': type,
					'length': length,
					'description': 'routing_information',
					'value': {
						'public_key': this._byteArrayToHexString(pubkey),
						'short_channel_id': this._byteArrayToHexString(shortChannelId),
						'fee_base_msat': this._byteArrayToInt(feeBaseMsat),
						'fee_proportional_millionths': this._byteArrayToInt(feeProportionalMillionths),
						'cltv_expiry_delta': this._byteArrayToInt(cltvExpiryDelta)
					}
				};
			case '9':
				return {
					'type': type,
					'length': length,
					'description': 'feature_bits',
					'value': this._bech32ToBinaryString(this._bech32ToFiveBitArray(data))
				};
			default:
			// reader MUST skip over unknown fields
		}
	},

	_bech32ToBinaryString: function (byteArray) {
		return Array.prototype.map.call(byteArray, function (byte) {
			return ('000000' + byte.toString(2)).slice(-5);
		}).join('');
	},

	_byteArrayToInt: function (byteArray) {
		let value = 0;
		for (let i = 0; i < byteArray.length; ++i) {
			value = (value << 8) + byteArray[i];
		}
		return value;
	},

	_bech32ToUTF8String: function (str) {
		let int5Array = this._bech32ToFiveBitArray(str);
		let byteArray = this._fiveBitArrayTo8BitArray(int5Array);

		let utf8String = '';
		for (let i = 0; i < byteArray.length; i++) {
			utf8String += '%' + ('0' + byteArray[i].toString(16)).slice(-2);
		}
		return decodeURIComponent(utf8String);
	},

	_byteArrayToHexString: function (byteArray) {
		return Array.prototype.map.call(byteArray, function (byte) {
			return ('0' + (byte & 0xFF).toString(16)).slice(-2);
		}).join('');
	},

	_fiveBitArrayTo8BitArray: function (int5Array, includeOverflow) {
		let count = 0;
		let buffer = 0;
		let byteArray = [];
		int5Array.forEach((value) => {
			buffer = (buffer << 5) + value;
			count += 5;
			if (count >= 8) {
				byteArray.push(buffer >> (count - 8) & 255);
				count -= 8;
			}
		});
		if (includeOverflow && count > 0) {
			byteArray.push(buffer << (8 - count) & 255);
		}
		return byteArray;
	},

	_bech32ToFiveBitArray: function (str) {
		let array = [];
		for (let i = 0; i < str.length; i++) {
			array.push(this._bech32CharValues.indexOf(str.charAt(i)));
		}
		return array;
	},

	_extractTags: function (str) {
		let tags = [];
		while (str.length > 0) {
			let type = str.charAt(0);
			let dataLength = this._bech32ToInt(str.substring(1, 3));
			let data = str.substring(3, dataLength + 3);
			tags.push({
				'type': type,
				'length': dataLength,
				'data': data
			});
			str = str.substring(3 + dataLength, str.length);
		}
		return tags;
	},

	_decodeHumanReadablePart: function (humanReadablePart) {
		let prefixes = ['lnbc', 'lntb', 'lnbcrt', 'lnsb', 'lntbs'];
		let prefix;
		prefixes.forEach(value => {
			if (humanReadablePart.substring(0, value.length) === value) {
				prefix = value;
			}
		});
		if (prefix == null) throw 'Malformed request: unknown prefix'; // A reader MUST fail if it does not understand the prefix.
		let amount = this._decodeAmount(humanReadablePart.substring(prefix.length, humanReadablePart.length));
		return {
			'prefix': prefix,
			'amount': (typeof amount) === "string" ? 0 : amount
		}
	},

	_decodeAmount: function (str) {
		if (str.length === 0) {
			return 'Any amount' // A reader SHOULD indicate if amount is unspecified
		}
		let multiplier = this._isDigit(str.charAt(str.length - 1)) ? '-' : str.charAt(str.length - 1);
		let amount = multiplier === '-' ? str : str.substring(0, str.length - 1);
		if (amount.substring(0, 1) === '0') {
			throw 'Malformed request: amount cannot contain leading zeros';
		}
		amount = Number(amount);
		if (amount < 0 || !Number.isInteger(amount)) {
			throw 'Malformed request: amount must be a positive decimal integer'; // A reader SHOULD fail if amount contains a non-digit
		}

		switch (multiplier) {
			case 'p':
				return amount / 10;
			case 'n':
				return amount * 100;
			case 'u':
				return amount * 100000;
			case 'm':
				return amount * 100000000;
			case '-':
				return amount * 100000000000;
			default:
				// A reader SHOULD fail if amount is followed by anything except a defined multiplier.
				throw 'Malformed request: undefined amount multiplier';
		}
	},

	_isDigit: function (str) {
		return str >= '0' && str <= '9'
	},

	_bech32ToInt: function (str) {
		let sum = 0;
		for (let i = 0; i < str.length; i++) {
			sum = sum * 32;
			sum = sum + this._bech32CharValues.indexOf(str.charAt(i));
		}
		return sum;
	}
};