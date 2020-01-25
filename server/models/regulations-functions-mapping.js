'use strict';

module.exports = function (Regulationsfunctionsmapping) {
	Regulationsfunctionsmapping.afterRemote('find', async (ctx, output) => {
		if (!ctx.result) {
			return;
		}
		for (let i = 0; i < ctx.result.length; i++) {
			const regulation = ctx.result[i];
			let quest = await Regulationsfunctionsmapping.app.models.Questions
				.find({
					function: {
						$in: regulation.functionsMapping
					}
				});
			if (!quest) {
				continue;
			}
			try {
				regulation.questions = quest;
				delete regulation.functionsMapping;
			} catch (error) {
				console.log('the regulation parse failed');
			}
		}
		return;
	});

	Regulationsfunctionsmapping.afterRemote('findById', async (ctx, output) => {
		if (!ctx.result) {
			return;
		}
		const regulation = ctx.result;
		let quest = await Regulationsfunctionsmapping.app.models.Questions
			.find({
				function: {
					$in: regulation.functionsMapping
				}
			});
		try {
			regulation.questions = quest;
			delete regulation.functionsMapping;
		} catch (error) {
			console.log('the regulation parse failed');
		}
		return;
	});
};
