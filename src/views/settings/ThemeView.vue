<script>
	import {
		defineComponent,
		ref,
	} from 'vue';
	import {
		IonHeader,
		IonToolbar,
		IonList,
		IonItem,
		IonButtons,
		IonButton,
		IonLabel,
		IonRadioGroup,
		IonRadio,
		IonToggle
	} from '@ionic/vue';

	import PapillonBackButton from '@/components/PapillonBackButton.vue';

	export default defineComponent({
		name: 'FolderPage',
		components: {
			IonHeader,
			IonToolbar,
			IonButtons,
			IonButton,
			IonLabel,
			IonItem,
			IonList,
			IonRadioGroup,
			IonRadio,
			PapillonBackButton,
			IonToggle
		},
		data() {
			return {
				availableFonts: [
					{ name: "Hind (Par défaut)", font: "Hind" },
					{ name: "Asap", font: "Asap" },
					{ name: "Merriweather", font: "Merriweather" },
					{ name: "Sofia Sans", font: "Sofia Sans" },
					{ name: "OpenDyslexic (Expérimental)", font: "OpenDyslexic" },
					{ name: "Système", font: "system-ui" },
				],
				customThemeModeList: localStorage.getItem('customThemeMode') == 'true',
				currentTheme: localStorage.getItem('themeMode'),
				currentFont: getComputedStyle(document.body).getPropertyValue('--papillon-font'),
			}
		},
		methods: {
			changeTick(option) {
				let el = this.$refs[option];
				let elChecked = el.$el.checked;

				localStorage.setItem(option, elChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
				this.checkThemeMode();

				if (option == "useScolColors") {
					localStorage.removeItem('SubjectColors');
				} else if (option == "customThemeMode" && elChecked == false) {
					localStorage.removeItem('themeMode');
				}
			},
			reset() {
				// remove the customizations from local storage
				localStorage.removeItem('customizations');

				// reset the css variables
				document.body.style = '';

				// reset the font select
				this.currentFont = this.availableFonts[0].font;
			},
			fontChange() {
				let font = this.$refs.fontSelect.$el.value;
				this.currentFont = font;

				document.body.style.setProperty('--papillon-font', '"' + font + '"');

				// save it in local storage
				let customizations = JSON.parse(localStorage.getItem('customizations')) || {};

				customizations.font = font;

				localStorage.setItem('customizations', JSON.stringify(customizations));
			},
			changeThemeMode() {
				let themeModeValue = this.$refs.themeMode.$el.value;

				localStorage.setItem('themeMode', themeModeValue);

				this.checkThemeMode();
				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			tweakProgressBar() {
				let tweakProgressBar = this.$refs.tweakProgressBar;
				let tweakProgressBarChecked = tweakProgressBar.$el.checked;

				localStorage.setItem('tweakProgressBar', tweakProgressBarChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			tweakProgressBarShowPast() {
				let tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
				let tweakProgressBarShowPastChecked = tweakProgressBarShowPast.$el.checked;

				localStorage.setItem('tweakProgressBarShowPast', tweakProgressBarShowPastChecked);

				document.dispatchEvent(new CustomEvent('settingsUpdated'));
			},
			checkThemeMode() {
				let themeMode = this.$refs.themeMode;
				let customThemeMode = this.$refs.customThemeMode;

				if (localStorage.getItem('customThemeMode') == 'true') {
					let enableTheme = null;
					if (localStorage.getItem('themeMode') != null) {
						enableTheme = localStorage.getItem('themeMode') == 'dark' ? 'dark' : 'light';
					} else {
						enableTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
					}

					this.customThemeModeList = true;
					customThemeMode.$el.checked = true;
					themeMode.$el.value = enableTheme;
				} else {
					this.customThemeModeList = false;
					customThemeMode.$el.checked = false;
				}
			}
		},
		mounted() {		
			// get useScolColors ref
			let useScolColors = this.$refs.useScolColors;
			useScolColors.$el.checked = localStorage.getItem('useScolColors') == 'true';

			// fontSelect
			// get --papillon-font from css
			this.currentFont = getComputedStyle(document.body).getPropertyValue('--papillon-font').replace(/"/g, ''); 

			// get tweakProgressBar ref
			let tweakProgressBar = this.$refs.tweakProgressBar;
			tweakProgressBar.$el.checked = localStorage.getItem('tweakProgressBar') == 'true';

			// get tweakProgressBarShowPast ref
			let tweakProgressBarShowPast = this.$refs.tweakProgressBarShowPast;
			tweakProgressBarShowPast.$el.checked = localStorage.getItem('tweakProgressBarShowPast') != 'false'; // default true

			// check if custom theme mode is enabled
			this.checkThemeMode();
		}
	});
</script>

<template>
		<IonHeader class="AppHeader" collapse="fade" translucent>
			<IonToolbar>

				<ion-buttons slot="start">
					<PapillonBackButton></PapillonBackButton>
				</ion-buttons>

				<ion-title mode="md">Personnaliser Papillon</ion-title>

				<ion-buttons slot="end">
					<IonButton @click="reset()">Réinitialiser</IonButton>
				</ion-buttons>

			</IonToolbar>
		</IonHeader>

		<ion-content :fullscreen="true">

			<IonList :inset="true" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">contrast</span>
					<IonLabel class="ion-text-wrap">
						<h2>Choisir le thème manuellement</h2>
					</IonLabel>
					<IonToggle slot="end" ref="customThemeMode" @ionChange="changeTick('customThemeMode')"></IonToggle>
				</IonItem>

				<ion-radio-group v-if="customThemeModeList" :value="currentTheme" ref="themeMode" @ionChange="changeThemeMode">
					<ion-item :key="0">
						<span class="material-symbols-outlined mdls" slot="start">dark_mode</span>
						<ion-label>Mode sombre</ion-label>
						<ion-radio slot="end" value="dark"></ion-radio>
					</ion-item>

					<ion-item :key="1">
						<span class="material-symbols-outlined mdls" slot="start">light_mode</span>
						<ion-label>Mode clair</ion-label>
						<ion-radio slot="end" value="light"></ion-radio>
					</ion-item>
				</ion-radio-group>
			</IonList>

			<IonList :inset="true" lines="inset">
				<ion-radio-group :value="currentFont" ref="fontSelect" @ionChange="fontChange">
					<ion-item :key="i" v-for="(font, i) in availableFonts">
						<ion-label :style="`font-family: '${font.font}';`">{{ font.name }}</ion-label>
						<ion-radio slot="end" :value="font.font"></ion-radio>
					</ion-item>
				</ion-radio-group>
			</IonList>

			<IonList :inset="true" lines="inset">
				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">invert_colors</span>
					<IonLabel class="ion-text-wrap">
						<h2>Utiliser les couleurs de votre service scolaire</h2>
						<p>Permet d'utiliser les couleurs de votre service scolaire pour identifier les matières.</p>
					</IonLabel>
					<IonToggle slot="end" ref="useScolColors" @ionChange="changeTick('useScolColors')"></IonToggle>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">timelapse</span>
					<IonLabel class="ion-text-wrap">
						<h2>Activer l'animation de la progression d'un cours</h2>
						<p>(Expérimental) Indiquer la progression d'un cours en cours avec une animation</p>
					</IonLabel>
					<IonToggle slot="end" ref="tweakProgressBar" @ionChange="changeTick('tweakProgressBar')"></IonToggle>
				</IonItem>

				<IonItem>
					<span class="material-symbols-outlined mdls" slot="start">fast_rewind</span>
					<IonLabel class="ion-text-wrap">
						<h2>Montrer la progression des cours passés</h2>
						<p>(Expérimental) Indiquer les cours passés avec un style différent</p>
					</IonLabel>
					<IonToggle slot="end" ref="tweakProgressBarShowPast" @ionChange="changeTick('tweakProgressBarShowPast')"></IonToggle>
				</IonItem>
			</IonList>

		</ion-content>
</template>

<style scoped>
	.md .paddingFixMd {
		padding-left: 15px;
	}
</style>