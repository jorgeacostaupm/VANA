import { updateData } from "@/store/slices/dataSlice";
import {
  updateDescriptions,
  updateHierarchy,
} from "@/store/async/metaAsyncReducers";
import * as api from "@/utils/cantabAppServices";
import { setGroupVar, setIdVar, setTimeVar } from "@/store/slices/cantabSlice";
import { DATASETS } from "@/utils/Constants";

import { pubsub } from "@/utils/pubsub";
const { publish } = pubsub;

const idVar = "pseudon_id";
const groupVar = "site";
const timeVar = "visit";

const env = import.meta?.env?.MODE || process.env.NODE_ENV || "dev";
const { dataPath, hierarchyPath, descriptionsPath, filename } =
  env === "production" ? DATASETS.prod : DATASETS.dev;

export default async function loadTestData(dispatch) {
  try {
    let data = await api.fetchTestData(dataPath);
    await dispatch(updateData({ data, isGenerateHierarchy: true, filename }));

    let hierarchy = await api.fetchHierarchy(hierarchyPath);
    await dispatch(updateHierarchy({ hierarchy, filename }));

    let descriptions = await api.fetchDescriptionsCSV(descriptionsPath);
    await dispatch(
      updateDescriptions({ descriptions, filename: "Descriptions" })
    );

    dispatch(setIdVar(idVar));
    dispatch(setGroupVar(groupVar));
    dispatch(setTimeVar(timeVar));
  } catch (error) {
    publish("notification", {
      message: "Error Loading Test Data",
      description: error.message,
      type: "error",
    });
  }
}
