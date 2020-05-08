'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const sharp = require('sharp');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Comprime uma imagem de acordo com as opcoes

	=> _input pode ser buffer ou caminho
	=> _maxWidth em pixels - default 0 (sem resize)
	=> _qualityLevel diminui 10% a cada nivel para baixo, entre 9 e 1 (90% e 10% de qualidade) - default 9

	** resize sempre para menos, nunca extende uma imagem, independente do valor de _maxWidth
	** saida sempre em .jpeg
*/
const compress = (_input, _maxWidth = 0, _qualityLevel = 9) => {
	return new Promise((resolve, reject) => {
		const qualityLevel = (/^[1-9]{1}$/.test(_qualityLevel) ? parseFloat(_qualityLevel) : 9) / 10;
		const iMaxWidth = parseFloat(_maxWidth);
		const maxWidth = (isNaN(iMaxWidth) ? 0 : Math.round(iMaxWidth));
		const input = (
			maxWidth ? (
				sharp(_input)
				.resize(
					{
						width: maxWidth,
						fastShrinkOnLoad: true,
						withoutEnlargement: true,
						kernel: 'lanczos3'
					}
				)
			) : (
				sharp(_input)
			)
		);

		// Para jpeg comprimido
		input
		.flatten(
			{
				r: 255,
				g: 255,
				b: 255
			}
		)
		.jpeg(
			{
				chromaSubsampling: '4:2:0',
				quality: 100 * qualityLevel,
				progressive: true,
				force: true
			}
		)
		.withMetadata()
		.toBuffer()
		.then(
			output => {
				resolve(output);
			}
		)
		.catch(
			err => {
				reject(err);
			}
		);
	});
};
// -------------------------------------------------------------------------

module.exports = {
	compress
};
