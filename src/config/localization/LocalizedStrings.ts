import LocalizedStrings from 'react-localization';
import { ar } from './ar';
import { en } from './en';
import { Languages } from './Languages';

export let strings = new LocalizedStrings({
 en:en,
ar:ar
});
strings.setLanguage(Languages.EN);