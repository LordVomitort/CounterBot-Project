interface FontItem {
	family: string;
	variants: string[];
}

export type FontType = {
	family: string;
	value: string;
};
export const FontLoader = async () => {
	async function fetchFonts() {
		let fontList;
		try {
			// const response = await fetch("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyDBzzPRqWl2eU_pBMDr_8mo1TbJgDkgst4&sort=trending");
			const response = await fetch("https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyCCOdkFjv85PTz2N-b65BvA3ieqk-w2O7E");
			const json = await response.json();
			fontList = json.items.map((item: FontItem) => {
				const family_name = item.family;
				let value = family_name.replace(/ /g, "+");
				if (item.variants.length > 0) {
					value += ":" + item.variants.join(",");
				}
				return { family: family_name, value };
			});
		} catch (e) {
			console.log("Error loading fonts", e);
			console.error("Fonts error: ", e);
			return false;
		}
		return fontList;
	}
	return await fetchFonts();
};
