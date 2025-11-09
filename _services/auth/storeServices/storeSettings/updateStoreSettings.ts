import { Failure } from "@Types/ResultTypes/errors/Failure";
import { MongoId } from "@Types/Schema/MongoId";
import { StoreSettingDataBody } from "@Types/Schema/StoreSetting";
import extractSafeThrowableResult from "@utils/extractSafeThrowableResult";
import htmlToMarkdown from "@utils/htmlToMarkdown";
import safeThrowable from "@utils/safeThrowable";
import {updateStoreSettings as updateSettings} from "@repositories/store/storeSettingsRepo"

async function updateStoreSettings(storeId: MongoId, updatedData: StoreSettingDataBody) {
  const { domain, address, colourTheme, paymentMethods, seo, shipmentCompanies, socialMedia, storePages } = updatedData;

  let markdownPages:Array<{title:string, markdown:string}> = [];
  if(storePages?.length) {
    markdownPages = storePages.map(({pageTitle, htmlContent}) => {
        return { title:pageTitle, markdown: htmlToMarkdown(htmlContent) }
    })
  }

  const data = {
    domain,
    address,
    colourTheme,
    paymentMethods,
    seo,
    shipmentCompanies,
    socialMedia,
    $set: { storePages: markdownPages} ,
  };

  const safeUpdate = safeThrowable(
    () => updateSettings(storeId, data),
    (error) => new Failure((error as Error).message)
  );

  return await extractSafeThrowableResult(() => safeUpdate);
}

export default updateStoreSettings;
