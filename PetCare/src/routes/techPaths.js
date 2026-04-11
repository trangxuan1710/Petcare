export const TECH_PATHS = {
    HOME: '/techs/home',
    RECORD_RESULT: '/techs/record-result',
    MEDICINE_SELECTOR: '/techs/medicine-selector',
};

export const buildTechRecordResultPath = (id) => `${TECH_PATHS.RECORD_RESULT}/${id}`;
