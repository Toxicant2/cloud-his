import {
    fetch,
    put,
    post,
    deleteHttp
} from './http'
/**
 *  药品调价单
 */
// 查看详情
export const getSkAdjust = id => {
    return fetch(`/catalog/op/sk/adjust/${id}`)
}

// 删除未确认药品调价单
export const deleteSkAdjust = id => {
    return deleteHttp(`/catalog/op/sk/adjust/${id}`)
}

// 审核（确认）
export const auditSkAdjust = id => {
    return put(`/catalog/op/sk/adjust/audit/${id}`)
}

// 获取调价列表
export const getSkAdjustList = data => {
    return fetch('/catalog/op/sk/adjust/page', data)
}

// 调价保存、修改
export const saveSkAdjust = data => {
    return post('/catalog/op/sk/adjust/save', data)
}

/**
 *  药品调价单下载
 */
// 导出药品调价单
export const exportSkAdjust = (id, header) => {
    return post(`/catalog/opSkAdjustDownload/${id}`, {}, header)
}

/**
 *  系统疾病目录-下载到私库
 */

// 按名称检索药品目录
export const getDiseaseList = data => {
    return fetch('/catalog/org/disease/cat/info', data)
}
// 下载药品目录
export const downloadDisease = data => {
    return post('/catalog/org/disease/cat/save', data)
}
// 按诊所下载药品目录
export const downloadByClinic = id => {
    return post(`/catalog/org/disease/cat/saveByOrgIds?orgId=${id}`)
}

/**
 * 系统收费项目药品项目-私库
 */
// 停用系统药品收费项目、药品项目-私库
export const updateCatItemStatus = (id, status) => {
    return post(`/catalog/org/accrual/cat/blockUp/${id}?isUse=${status}`)
}

// 引用运营中心数据（收费项目维护）
export const appointOrgCenter = data => {
    return post('/catalog/org/accrual/cat/copy/orgCenter', data)
}

// 运营中心引用诊所数据
export const appointClinic = data => {
    return post('/catalog/org/accrual/cat/copy/orgId', data)
}

// 药品保存
export const saveCatItem = data => {
    return post('/catalog/org/accrual/cat/download-stock/drug', data)
}

// 输入药品项目名称获取西药、中药、材料数据
// export const getCatItem = data => {
//     return fetch(`/catalog/org/accrual/cat/drug/list/data`, data)
// }

// 分页获取系统药品
export const getCatList = data => {
    return fetch('/catalog/org/accrual/cat/list/page', data)
}

// 获取收费项目列表
export const getAccrualList = () => {
    return fetch('/catalog/org/accrual/cat/nameListType')
}

// 收费目录和药品列表查询
export const getChargePageList = data => {
    return fetch('/catalog/org/accrual/cat/query/charge/page', data)
}

// 分页：诊所查询收费项目（性质：西药、中药、检验/检查、其他）西药10 检查检验30 中药20 治疗40 其他99spell_code:拼音码,qty：库存,retail_price：售价 spec_dose：规格
export const getCharaPageList = (chara, data) => {
    return fetch(`/catalog/org/accrual/cat/query/chargePage/${chara}`, data)
}

// 编辑系统收费项目
export const updateCatItem = data => {
    return put('/catalog/org/accrual/cat/update', data)
}

// 药品分类
export const getCatTree = type => {
    return fetch(`/catalog/sys/cat/type/tree?type=${type}`)
}

// 药品名称列表
export const getDrugNameList = data => {
    return fetch('/catalog/sys/cat/stock/list/page', data)
}

/**
 * 机构参数维护
 */
// 诊所获取自己的所有参数配置和区域运营参数
export const getOrgConfig = data => {
    return fetch('/catalog/org-conf/info', data)
}

// 获取参数类型
export const getParamsType = () => {
    return fetch('/catalog/orgconf/list')
}

// 根据参数类型打开列表
export const getParamsList = data => {
    return fetch(`/catalog/orgconf?parentId=${data.parentId}`)
}

// 批量修改 机构参数
export const editParams = data => {
    return put('/catalog/orgconf/batch', data)
}

// 更新诊所的参数（从模板上）
export const freshParams = () => {
    return post('/catalog/orgconf/refresh')
}
/**
 * 系统疾病目录-私库
 */
export const enable = data => {
    return post('/catalog/org/disease/cat/blockUp', data)
}

export const getDiagnosticList = () => {
    return fetch('/catalog/org/disease/cat/diagnosticName')
}

// 分页获取疾病信息
export const getDiagnosticListByPage = data => {
    return fetch('/catalog/org/disease/cat/page', data)
}

// 分页获取中医诊断
export const getChinaDisease = data => {
    return fetch('/catalog/sys/china/disease/list/page', data)
}

// 按疾病类别  三级列表
export const getDiseaseListByType = () => {
    return fetch('/catalog/org/disease/cat/page/type/list')
}

/**
 * 药师审方权限表
 */

//  根据审核人id查找都有哪些诊所的审方权限
export const getCheckListById = id => {
    return fetch(`/catalog/orgdrcheckrecipe/check/orgId?checkedUserId=${id}`)
}

// 根据诊所查找都有哪些审核人有审方权限
export const getCheckList = ids => {
    return fetch(`/catalog/orgdrcheckrecipe/check/user?checkedOrgIds=${ids}`)
}

/**
 * 统一目录-药品|项目-公库
 * type: stock-药品
 *       accrual-项目
 */
// 新增-公库
export const addCatStock = (data, type) => {
    return post(`/catalog/sys/cat/${type}`, data)
}

// 停用-公库
export const updateCatStockItemStatus = (id, status, type) => {
    return post(`/catalog/sys/cat/${type}/blockUp/${id}?isUse=${status}`)
}

// 分页获取page-公库list
export const getCatStockList = (data, type) => {
    return fetch(`/catalog/sys/cat/${type}/list/page`, data)
}

// 获取某个药品定向用户
export const getCatStockItemInsurance = id => {
    return fetch(`/catalog/sys/cat/stock/${id}`)
}

// 获取药品的路径
export const getDrugUrl = id => {
    return fetch(`/catalog/sys/cat/stock/geturl?id=${id}`)
}

// 修改-公库
export const updateCatStock = (data, type) => {
    return put(`/catalog/sys/cat/${type}`, data)
}

/**
 * 枚举详细
 */

// 根据枚举类目id获取枚举详细列表
export const getDictById = data => {
    return fetch('/catalog/sys/enum/doct/all', data)
}

// 根据枚举类目id数组获取对应数组id枚举详细列表
export const getDictByIdList = data => {
    return fetch(`/catalog/sys/enum/doct/allListType/?${data}`)
}

// 获取字典列表
export const getDictList = data => {
    return fetch('/catalog/sys/enum/dict/type/list/page', data)
}

// 删除枚举详细
export const delDictDetail = id => {
    return deleteHttp(`/catalog/sys/enum/doct/${id}`)
}

// 修改枚举停用、启用状态
export const updateDictStatus = data => {
    return post('/catalog/sys/enum/doct/blockUp', data)
}

// 修改枚举详细
export const updateDictDetail = data => {
    return put('/catalog/sys/enum/doct/update', data)
}
/**
 * 从ES中获取智能诊断list
 * */
export const getSysDiseaseFromES = data => {
    return fetch('/catalog/sys/disease/es/list', data)
}

/**
 * 获取某个疾病的详情，包括 诊断依据 鉴别诊断 相关处置 处置意见 。。。
 * */
export const getSysDiseaseDetail = diseaseId => {
    return fetch(`/catalog/sys/disease/${diseaseId}`)
}

// 根据公库疾病id，获取私库疾病详情
export const getDiseaseDetailById = diseaseId => {
    return fetch(`/catalog/sys/disease/org/${diseaseId}`)
}

/**
 * 系统编号规则维护接口
 */

// 获取系统编号规则维护接口 list page
export const getBasicSettingData = data => {
    return fetch('/catalog/number/page', data)
}

// 修改系统编号规则
export const updateBasicSetting = data => {
    return put('/catalog/number', data)
}

// 新增系统编号规则
export const addBasicSetting = data => {
    return post('/catalog/number', data)
}

// 删除系统编号规则
export const delBasicSetting = data => {
    return deleteHttp('/catalog/number', data)
}

// 生成系统编号
export const getBasicSettingNum = name => {
    return post(`/catalog/number/cs/${name}`)
}

// 引用运营中心数据（编号规则）
export const saveByOrgLevel = () => {
    return post('/catalog/number/saveByOrgLevel')
}

// 运营中心引用诊所（编号规则）
export const saveByOrgId = id => {
    return post(`/catalog/number/byOrgId?orgId=${id}`)
}

/** 生产厂家/产地编码 */
;
('manufacturerCode')
/** 医技申请单号 */
;
('hisTechApplyNum')
/** 库存盘点单号 */
;
('stockInventoryCheck')
/** 门诊发药单号 */
;
('outpatientDelivery')
/** 疫苗收费单据号 */
;
('vaccineChargeNum')
/** 经销商编码 */
;
('dealerCode')
/** 处方模板号 */
;
('recipeTemplateNum')
/** 库存申领单号 */
;
('stockApply')
/** 发票登记号 */
;
('invoiceRegNum')
/** 门诊收费单据号 */
;
('outpatientChargeNum')
/** 门诊个人交账单号 */
;
('opAccountNum')
/** 门诊处方号 */
;
('outpatientRecipeNum')
/** 门诊病历号 */
;
('outpatientCaseNum')
/** 科室申领单号 */
;
('deptApply')
/** 门诊病历模板号 */
;
('caseTemplateNum')
/** 统一收费目录收费项目编号 */
;
('ucStockCatSFXM')
/** 门诊号 */
;
('outpatientNum')
/** 库存目录编码 */
;
('stockCat')
/** 统一库存目录西药编号 */
;
('ucStockCatXY')
/** 统一库存目录中成药编号 */
;
('ucStockCatZCY')
/** 统一库存目录中药饮片编号 */
;
('ucStockCatZYYP')
/** 统一库存目录中药成品药编号 */
;
('ucStockCatZYCPY')
/** 统一库存目录材料编号 */
;
('ucStockCatCL')
/** 统一库存目录生物制品编号 */
;
('ucStockCatSWZP')
/** 库存变动记录-损失单号 */
;
('stockChangeLoss')

// 生成系统编号
export const createSysNum = dictCode => {
    return post(`/catalog/number/cs/${dictCode}`)
}

