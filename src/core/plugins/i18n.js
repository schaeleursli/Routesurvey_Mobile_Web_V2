import { createI18n } from "vue-i18n";
import en from "./locales/en";
import de from "./locales/de";
import ar from "./locales/ar";

const messages = {
  en,
  de,
  ar,
};

const i18n = createI18n({
  legacy: false,
  locale: "en",
  globalInjection: true,
  messages,
});

export default i18n;
