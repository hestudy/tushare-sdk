/**
 * 财务数据模型
 * 
 * 定义公司财务报表相关的数据结构
 */

/**
 * 财务数据项
 * 
 * 表示公司的财务报表数据,包括利润表、资产负债表等关键指标
 * 
 * @example
 * ```typescript
 * const financial: FinancialItem = {
 *   ts_code: '000001.SZ',
 *   end_date: '20231231',
 *   ann_date: '20240430',
 *   report_type: 4,
 *   total_revenue: 189234567890,
 *   revenue: 189234567890,
 *   net_profit: 45678901234,
 *   total_assets: 5678901234567,
 *   total_liabilities: 4567890123456,
 *   total_equity: 1111011111111,
 *   eps: 2.34,
 *   roe: 15.67
 * };
 * ```
 */
export interface FinancialItem {
  /** 股票代码 (如 000001.SZ) */
  ts_code: string;

  /** 报告期 (YYYYMMDD 格式, 如 20231231) */
  end_date: string;

  /** 公告日期 (YYYYMMDD 格式) */
  ann_date: string;

  /**
   * 报告类型
   * - 1: 一季报
   * - 2: 半年报 (中报)
   * - 3: 三季报
   * - 4: 年报
   */
  report_type: 1 | 2 | 3 | 4;

  /** 营业总收入 (元) */
  total_revenue?: number;

  /** 营业收入 (元) */
  revenue?: number;

  /** 净利润 (元) */
  net_profit?: number;

  /** 总资产 (元) */
  total_assets?: number;

  /** 总负债 (元) */
  total_liabilities?: number;

  /** 股东权益 (元) */
  total_equity?: number;

  /** 每股收益 (元/股) */
  eps?: number;

  /** 净资产收益率 (%) */
  roe?: number;
}

/**
 * 财务数据查询参数
 * 
 * 用于查询公司财务报表数据的参数
 * 
 * @example
 * ```typescript
 * // 查询指定公司的年报
 * const params: FinancialParams = {
 *   ts_code: '000001.SZ',
 *   report_type: 4
 * };
 * 
 * // 查询指定时间范围的财务数据
 * const params2: FinancialParams = {
 *   ts_code: '000001.SZ',
 *   start_date: '20200101',
 *   end_date: '20231231'
 * };
 * ```
 */
export interface FinancialParams {
  /** 股票代码 (如 000001.SZ) */
  ts_code?: string;

  /** 报告期 (YYYYMMDD 格式) */
  period?: string;

  /** 开始报告期 (YYYYMMDD 格式) */
  start_date?: string;

  /** 结束报告期 (YYYYMMDD 格式) */
  end_date?: string;

  /**
   * 报告类型
   * - 1: 一季报
   * - 2: 半年报
   * - 3: 三季报
   * - 4: 年报
   */
  report_type?: 1 | 2 | 3 | 4;
}

/**
 * 财务数据查询参数 (三大财务报表通用)
 *
 * 用于查询利润表、资产负债表、现金流量表数据的参数
 *
 * @example
 * ```typescript
 * // 查询指定公司的年报利润表
 * const params: FinancialQueryParams = {
 *   ts_code: '000001.SZ',
 *   period: '20231231'
 * };
 *
 * // 查询指定时间范围的财务数据
 * const params2: FinancialQueryParams = {
 *   ts_code: '600519.SH',
 *   start_date: '20200101',
 *   end_date: '20231231'
 * };
 * ```
 */
export interface FinancialQueryParams {
  /** 股票代码 (如 000001.SZ) */
  ts_code?: string;

  /** 公告日期 (YYYYMMDD 格式) */
  ann_date?: string;

  /** 报告期开始日期 (YYYYMMDD 格式) */
  start_date?: string;

  /** 报告期结束日期 (YYYYMMDD 格式) */
  end_date?: string;

  /** 报告期 (YYYYMMDD 格式, 优先于start_date/end_date) */
  period?: string;

  /**
   * 报表类型
   * - "1": 合并报表
   * - "2": 单季合并
   * - "3": 调整单季合并
   * - "4": 调整合并
   */
  report_type?: '1' | '2' | '3' | '4';

  /**
   * 公司类型
   * - "1": 合并报表
   * - "2": 单季度
   */
  comp_type?: '1' | '2';
}

/**
 * 利润表数据项
 *
 * 表示上市公司利润表的完整数据,包括94个字段
 * 包含收入、成本、利润、每股指标等核心财务指标
 *
 * **权限要求**: 至少 2000 积分
 *
 * @example
 * ```typescript
 * const income: IncomeStatementItem = {
 *   ts_code: '000001.SZ',
 *   ann_date: '20240430',
 *   end_date: '20231231',
 *   report_type: '4',
 *   total_revenue: 189234567890,
 *   n_income_attr_p: 45678901234,
 *   basic_eps: 2.34
 * };
 * ```
 */
export interface IncomeStatementItem {
  // 基本标识字段 (必填)
  /** 股票代码 (如 000001.SZ) */
  ts_code: string;
  /** 公告日期 (YYYYMMDD) */
  ann_date: string;
  /** 实际公告日期 (YYYYMMDD) */
  f_ann_date: string;
  /** 报告期 (YYYYMMDD) */
  end_date: string;
  /** 报表类型: 1-合并报表, 2-单季合并, 3-调整单季, 4-调整合并 */
  report_type: string;
  /** 公司类型: 1-一般工商业, 2-银行, 3-保险, 4-证券 */
  comp_type: string;
  /** 报告期类型: 1-一季报, 2-半年报, 3-三季报, 4-年报 */
  end_type: string;

  // 每股指标
  /** 基本每股收益 (元/股) */
  basic_eps?: number;
  /** 稀释每股收益 (元/股) */
  diluted_eps?: number;

  // 收入类指标
  /** 营业总收入 (元) */
  total_revenue?: number;
  /** 营业收入 (元) */
  revenue?: number;
  /** 利息收入 (元) - 银行专用 */
  int_income?: number;
  /** 已赚保费 (元) - 保险专用 */
  prem_earned?: number;
  /** 手续费及佣金收入 (元) */
  comm_income?: number;
  /** 手续费及佣金净收入 (元) */
  n_commis_income?: number;
  /** 其他经营净收益 (元) */
  n_oth_income?: number;
  /** 加:其他业务净收益 (元) */
  n_oth_b_income?: number;
  /** 保险业务收入 (元) */
  prem_income?: number;
  /** 减:分出保费 (元) */
  out_prem?: number;
  /** 提取未到期责任准备金 (元) */
  une_prem_reser?: number;
  /** 其中:分保费收入 (元) */
  reins_income?: number;
  /** 代理买卖证券业务净收入 (元) */
  n_sec_tb_income?: number;
  /** 证券承销业务净收入 (元) */
  n_sec_uw_income?: number;
  /** 受托客户资产管理业务净收入 (元) */
  n_asset_mg_income?: number;
  /** 其他业务收入 (元) */
  oth_b_income?: number;
  /** 加:公允价值变动净收益 (元) */
  fv_value_chg_gain?: number;
  /** 加:投资净收益 (元) */
  invest_income?: number;
  /** 其中:对联营企业和合营企业的投资收益 (元) */
  ass_invest_income?: number;
  /** 加:汇兑净收益 (元) */
  forex_gain?: number;

  // 成本费用类指标
  /** 营业总成本 (元) */
  total_cogs?: number;
  /** 营业成本 (元) */
  oper_cost?: number;
  /** 利息支出 (元) - 银行专用 */
  int_exp?: number;
  /** 手续费及佣金支出 (元) */
  comm_exp?: number;
  /** 营业税金及附加 (元) */
  biz_tax_surchg?: number;
  /** 销售费用 (元) */
  sell_exp?: number;
  /** 管理费用 (元) */
  admin_exp?: number;
  /** 研发费用 (元) */
  rd_exp?: number;
  /** 财务费用 (元) */
  fin_exp?: number;
  /** 其中:财务费用-利息费用 (元) */
  fin_exp_int_exp?: number;
  /** 其中:财务费用-利息收入 (元) */
  fin_exp_int_inc?: number;
  /** 资产减值损失 (元) */
  assets_impair_loss?: number;
  /** 信用减值损失 (元) */
  credit_impa_loss?: number;
  /** 其他资产减值损失 (元) */
  oth_impair_loss_assets?: number;
  /** 退保金 (元) - 保险专用 */
  prem_refund?: number;
  /** 赔付总支出 (元) - 保险专用 */
  compens_payout?: number;
  /** 提取保险责任准备金 (元) */
  reser_insur_liab?: number;
  /** 保单红利支出 (元) */
  div_payt?: number;
  /** 分保费用 (元) */
  reins_exp?: number;
  /** 业务及管理费 (元) - 保险专用 */
  oper_exp?: number;
  /** 减:摊回赔付支出 (元) */
  compens_payout_refu?: number;
  /** 减:摊回保险责任准备金 (元) */
  insur_reser_refu?: number;
  /** 减:摊回分保费用 (元) */
  reins_cost_refund?: number;
  /** 其他业务成本 (元) */
  other_bus_cost?: number;

  // 利润类指标
  /** 营业利润 (元) */
  operate_profit?: number;
  /** 加:营业外收入 (元) */
  non_oper_income?: number;
  /** 减:营业外支出 (元) */
  non_oper_exp?: number;
  /** 其中:减:非流动资产处置净损失 (元) */
  nca_disploss?: number;
  /** 利润总额 (元) */
  total_profit?: number;
  /** 所得税费用 (元) */
  income_tax?: number;
  /** 净利润(含少数股东损益) (元) */
  n_income?: number;
  /** 净利润(不含少数股东损益) (元) */
  n_income_attr_p?: number;
  /** 少数股东损益 (元) */
  minority_gain?: number;
  /** 其他综合收益 (元) */
  oth_compr_income?: number;
  /** 综合收益总额 (元) */
  t_compr_income?: number;
  /** 归属于母公司(或股东)的综合收益总额 (元) */
  compr_inc_attr_p?: number;
  /** 归属于少数股东的综合收益总额 (元) */
  compr_inc_attr_m_s?: number;

  // 其他指标
  /** 息税前利润 EBIT (元) */
  ebit?: number;
  /** 息税折旧摊销前利润 EBITDA (元) */
  ebitda?: number;
  /** 保险业务支出 (元) */
  insurance_exp?: number;
  /** 年初未分配利润 (元) */
  undist_profit?: number;
  /** 可分配利润 (元) */
  distable_profit?: number;
  /** 调整以前年度损益 (元) */
  adj_lossgain?: number;
  /** 提取法定盈余公积 (元) */
  withdra_legal_surplus?: number;
  /** 提取法定公益金 (元) */
  withdra_legal_pubfund?: number;
  /** 提取企业发展基金 (元) */
  withdra_biz_devfund?: number;
  /** 提取储备基金 (元) */
  withdra_rese_fund?: number;
  /** 提取任意盈余公积金 (元) */
  withdra_oth_ersu?: number;
  /** 职工奖金福利 (元) */
  workers_welfare?: number;
  /** 对股东的分配 (元) */
  distr_profit_shrhder?: number;
  /** 应付优先股股利 (元) */
  prfshare_payable_dvd?: number;
  /** 应付普通股股利 (元) */
  comshare_payable_dvd?: number;
  /** 转作股本的普通股股利 (元) */
  capit_comstock_div?: number;
  /** 扣除非经常性损益后的净利润 (元) */
  net_after_nr_lp_correct?: number;
  /** 套期净收益 (元) */
  net_expo_hedging_benefits?: number;
  /** 其他收益 (元) */
  oth_income?: number;
  /** 资产处置收益 (元) */
  asset_disp_income?: number;
  /** 持续经营净利润 (元) */
  continued_net_profit?: number;
  /** 终止经营净利润 (元) */
  end_net_profit?: number;
  /** 以摊余成本计量的金融资产终止确认损失 (元) */
  amodcost_fin_assets?: number;
  /** 营业总成本 (二) (元) */
  total_opcost?: number;
  /** 盈余公积转入 (元) */
  transfer_surplus_rese?: number;
  /** 住房周转金转入 (元) */
  transfer_housing_imprest?: number;
  /** 其他转入 (元) */
  transfer_oth?: number;

  /** 更新标识: 1-最新数据 */
  update_flag?: string;
}

/**
 * 资产负债表数据项
 *
 * 表示上市公司资产负债表的完整数据,包括81个字段
 * 包含资产、负债、所有者权益等关键指标
 *
 * **权限要求**: 至少 2000 积分
 *
 * @example
 * ```typescript
 * const balance: BalanceSheetItem = {
 *   ts_code: '000001.SZ',
 *   ann_date: '20240430',
 *   end_date: '20231231',
 *   report_type: '4',
 *   total_assets: 5678901234567,
 *   total_cur_liab: 2000000000000,
 *   total_ncl: 1500000000000
 * };
 * ```
 */
export interface BalanceSheetItem {
  // 基本标识字段 (必填)
  /** 股票代码 (如 000001.SZ) */
  ts_code: string;
  /** 公告日期 (YYYYMMDD) */
  ann_date: string;
  /** 实际公告日期 (YYYYMMDD) */
  f_ann_date: string;
  /** 报告期 (YYYYMMDD) */
  end_date: string;
  /** 报表类型: 1-合并报表, 2-单季合并, 3-调整单季, 4-调整合并 */
  report_type: string;
  /** 公司类型: 1-一般工商业, 2-银行, 3-保险, 4-证券 */
  comp_type: string;
  /** 报告期类型: 1-一季报, 2-半年报, 3-三季报, 4-年报 */
  end_type: string;

  // 所有者权益
  /** 期末总股本 (元) */
  total_share?: number;
  /** 资本公积金 (元) */
  cap_rese?: number;
  /** 未分配利润 (元) */
  undistr_porfit?: number;
  /** 盈余公积金 (元) */
  surplus_rese?: number;
  /** 专项储备 (元) */
  special_rese?: number;

  // 流动资产
  /** 货币资金 (元) */
  money_cap?: number;
  /** 交易性金融资产 (元) */
  trad_asset?: number;
  /** 应收票据 (元) */
  notes_receiv?: number;
  /** 应收账款 (元) */
  accounts_receiv?: number;
  /** 其他应收款 (元) */
  oth_receiv?: number;
  /** 预付款项 (元) */
  prepayment?: number;
  /** 应收股利 (元) */
  div_receiv?: number;
  /** 应收利息 (元) */
  int_receiv?: number;
  /** 存货 (元) */
  inventories?: number;
  /** 长期待摊费用 (元) */
  amor_exp?: number;
  /** 一年内到期的非流动资产 (元) */
  nca_within_1y?: number;
  /** 结算备付金 (元) */
  sett_rsrv?: number;
  /** 拆出资金 (元) */
  loanto_oth_bank_fi?: number;
  /** 应收保费 (元) */
  premium_receiv?: number;
  /** 应收分保账款 (元) */
  reinsur_receiv?: number;
  /** 应收分保合同准备金 (元) */
  reinsur_res_receiv?: number;
  /** 买入返售金融资产 (元) */
  pur_resale_fa?: number;
  /** 其他流动资产 (元) */
  oth_cur_assets?: number;
  /** 流动资产合计 (元) */
  total_cur_assets?: number;

  // 非流动资产
  /** 可供出售金融资产 (元) */
  fa_avail_for_sale?: number;
  /** 持有至到期投资 (元) */
  htm_invest?: number;
  /** 长期股权投资 (元) */
  lt_eqt_invest?: number;
  /** 投资性房地产 (元) */
  invest_real_estate?: number;
  /** 定期存款 (元) */
  time_deposits?: number;
  /** 其他资产 (元) */
  oth_assets?: number;
  /** 长期应收款 (元) */
  lt_rec?: number;
  /** 固定资产 (元) */
  fix_assets?: number;
  /** 在建工程 (元) */
  cip?: number;
  /** 工程物资 (元) */
  const_materials?: number;
  /** 固定资产清理 (元) */
  fixed_assets_disp?: number;
  /** 生产性生物资产 (元) */
  produc_bio_assets?: number;
  /** 油气资产 (元) */
  oil_and_gas_assets?: number;
  /** 无形资产 (元) */
  intan_assets?: number;
  /** 研发支出 (元) */
  r_and_d?: number;
  /** 商誉 (元) */
  goodwill?: number;
  /** 长期待摊费用 (元) */
  lt_amor_exp?: number;
  /** 递延所得税资产 (元) */
  defer_tax_assets?: number;
  /** 发放贷款及垫款 (元) */
  decr_in_disbur?: number;
  /** 其他非流动资产 (元) */
  oth_nca?: number;
  /** 非流动资产合计 (元) */
  total_nca?: number;
  /** 现金及存放中央银行款项 (元) */
  cash_reser_cb?: number;
  /** 存放同业和其他金融机构款项 (元) */
  depos_in_oth_bfi?: number;
  /** 贵金属 (元) */
  prec_metals?: number;
  /** 衍生金融资产 (元) */
  deriv_assets?: number;
  /** 应收分保未到期责任准备金 (元) */
  rr_reins_une_prem?: number;
  /** 应收分保未决赔款准备金 (元) */
  rr_reins_outstd_cla?: number;
  /** 应收分保寿险责任准备金 (元) */
  rr_reins_lins_liab?: number;
  /** 应收分保长期健康险责任准备金 (元) */
  rr_reins_lthins_liab?: number;
  /** 存出保证金 (元) */
  refund_depos?: number;
  /** 保户质押贷款 (元) */
  ph_pledge_loans?: number;
  /** 存出资本保证金 (元) */
  refund_cap_depos?: number;
  /** 独立账户资产 (元) */
  indep_acct_assets?: number;
  /** 其中:客户资金存款 (元) */
  client_depos?: number;
  /** 其中:客户备付金 (元) */
  client_prov?: number;
  /** 其中:交易席位费 (元) */
  transac_seat_fee?: number;
  /** 应收款项类投资 (元) */
  invest_as_receiv?: number;
  /** 资产总计 (元) */
  total_assets?: number;

  // 流动负债
  /** 长期借款 (元) */
  lt_borr?: number;
  /** 短期借款 (元) */
  st_borr?: number;
  /** 向中央银行借款 (元) */
  cb_borr?: number;
  /** 吸收存款及同业存放 (元) */
  depos_ib_deposits?: number;
  /** 拆入资金 (元) */
  loan_oth_bank?: number;
  /** 交易性金融负债 (元) */
  trading_fl?: number;
  /** 应付票据 (元) */
  notes_payable?: number;
  /** 应付账款 (元) */
  acct_payable?: number;
  /** 预收款项 (元) */
  adv_receipts?: number;
  /** 卖出回购金融资产款 (元) */
  sold_for_repur_fa?: number;
  /** 应付手续费及佣金 (元) */
  comm_payable?: number;
  /** 应付职工薪酬 (元) */
  payroll_payable?: number;
  /** 应交税费 (元) */
  taxes_payable?: number;
  /** 应付利息 (元) */
  int_payable?: number;
  /** 应付股利 (元) */
  div_payable?: number;
  /** 其他应付款 (元) */
  oth_payable?: number;
  /** 预提费用 (元) */
  acc_exp?: number;
  /** 递延收益 (元) */
  deferred_inc?: number;
  /** 应付短期债券 (元) */
  st_bonds_payable?: number;
  /** 应付分保账款 (元) */
  payable_to_reinsurer?: number;
  /** 保险合同准备金 (元) */
  rsrv_insur_cont?: number;
  /** 代理买卖证券款 (元) */
  acting_trading_sec?: number;
  /** 代理承销证券款 (元) */
  acting_uw_sec?: number;
  /** 一年内到期的非流动负债 (元) */
  non_cur_liab_due_1y?: number;
  /** 其他流动负债 (元) */
  oth_cur_liab?: number;
  /** 流动负债合计 (元) */
  total_cur_liab?: number;

  // 非流动负债
  /** 应付债券 (元) */
  bond_payable?: number;
  /** 长期应付款 (元) */
  lt_payable?: number;
  /** 专项应付款 (元) */
  specific_payables?: number;
  /** 预计负债 (元) */
  estimated_liab?: number;
  /** 递延所得税负债 (元) */
  defer_tax_liab?: number;
  /** 递延收益-非流动负债 (元) */
  defer_inc_non_cur_liab?: number;
  /** 其他非流动负债 (元) */
  oth_ncl?: number;
  /** 非流动负债合计 (元) */
  total_ncl?: number;
  /** 同业和其他金融机构存放款项 (元) */
  depos_oth_bfi?: number;
  /** 衍生金融负债 (元) */
  deriv_liab?: number;
  /** 吸收存款 (元) */
  depos?: number;
  /** 代理业务负债 (元) */
  agency_bus_liab?: number;
  /** 其他负债 (元) */
  oth_liab?: number;
  /** 预收保费 (元) */
  prem_receiv_adva?: number;
  /** 存入保证金 (元) */
  depos_received?: number;
  /** 保户储金及投资款 (元) */
  ph_invest?: number;
  /** 未到期责任准备金 (元) */
  reser_une_prem?: number;
  /** 未决赔款准备金 (元) */
  reser_outstd_claims?: number;
  /** 寿险责任准备金 (元) */
  reser_lins_liab?: number;
  /** 长期健康险责任准备金 (元) */
  reser_lthins_liab?: number;
  /** 长期应付职工薪酬 (元) */
  lt_payroll_payable?: number;
  /** 其他综合收益 (元) */
  oth_comp_income?: number;
  /** 其他权益工具 (元) */
  oth_eqt_tools?: number;
  /** 其他权益工具(优先股) (元) */
  oth_eqt_tools_p_shr?: number;
  /** 融出资金 (元) */
  lending_funds?: number;
  /** 应收款项 (元) */
  acc_receivable?: number;
  /** 应付短期融资款 (元) */
  st_fin_payable?: number;
  /** 应付款项 (元) */
  payables?: number;
  /** 持有待售的资产 (元) */
  hfs_assets?: number;
  /** 持有待售的负债 (元) */
  hfs_sales?: number;
  /** 以摊余成本计量的金融资产 (元) */
  cost_fin_assets?: number;
  /** 以公允价值计量且其变动计入其他综合收益的金融资产 (元) */
  fair_value_fin_assets?: number;
  /** 在建工程(合计)(元) */
  cip_total?: number;
  /** 其他应付款(合计)(元) */
  oth_pay_total?: number;
  /** 长期应付款(合计)(元) */
  long_pay_total?: number;
  /** 债权投资(元) */
  debt_invest?: number;
  /** 其他债权投资(元) */
  oth_debt_invest?: number;
  /** 其他权益工具投资(元) */
  oth_eq_invest?: number;
  /** 其他非流动金融资产(元) */
  oth_illiq_fin_assets?: number;
  /** 其他权益工具:永续债(元) */
  oth_eq_ppbond?: number;
  /** 应收款项融资(元) */
  receiv_financing?: number;
  /** 使用权资产(元) */
  use_right_assets?: number;
  /** 租赁负债(元) */
  lease_liab?: number;
  /** 合同资产(元) */
  contract_assets?: number;
  /** 合同负债(元) */
  contract_liab?: number;
  /** 应收票据及应收账款(元) */
  accounts_receiv_bill?: number;
  /** 应付票据及应付账款(元) */
  accounts_pay?: number;
  /** 其他应收款(合计)(元) */
  oth_rcv_total?: number;
  /** 固定资产(合计)(元) */
  fix_assets_total?: number;

  /** 更新标识: 1-最新数据 */
  update_flag?: string;
}

/**
 * 现金流量表数据项
 *
 * 表示上市公司现金流量表的完整数据,包括87个字段
 * 按经营、投资、筹资三大活动分类
 *
 * **权限要求**: 至少 2000 积分
 *
 * @example
 * ```typescript
 * const cashflow: CashFlowItem = {
 *   ts_code: '000001.SZ',
 *   ann_date: '20240430',
 *   end_date: '20231231',
 *   report_type: '4',
 *   n_cashflow_act: 12345678901,
 *   n_cashflow_inv_act: -3456789012,
 *   n_cash_flows_fnc_act: 2345678901
 * };
 * ```
 */
export interface CashFlowItem {
  // 基本标识字段 (必填)
  /** 股票代码 (如 000001.SZ) */
  ts_code: string;
  /** 公告日期 (YYYYMMDD) */
  ann_date: string;
  /** 实际公告日期 (YYYYMMDD) */
  f_ann_date: string;
  /** 报告期 (YYYYMMDD) */
  end_date: string;
  /** 公司类型: 1-一般工商业, 2-银行, 3-保险, 4-证券 */
  comp_type: string;
  /** 报表类型: 1-合并报表, 2-单季合并, 3-调整单季, 4-调整合并 */
  report_type: string;
  /** 报告期类型: 1-一季报, 2-半年报, 3-三季报, 4-年报 */
  end_type: string;

  // 经营活动现金流
  /** 净利润 (元) */
  net_profit?: number;
  /** 财务费用 (元) */
  finan_exp?: number;
  /** 销售商品、提供劳务收到的现金 (元) */
  c_fr_sale_sg?: number;
  /** 收到的税费返还 (元) */
  recp_tax_rends?: number;
  /** 客户存款和同业存放款项净增加额 (元) */
  n_depos_incr_fi?: number;
  /** 向中央银行借款净增加额 (元) */
  n_incr_loans_cb?: number;
  /** 向其他金融机构拆入资金净增加额 (元) */
  n_inc_borr_oth_fi?: number;
  /** 收到原保险合同保费取得的现金 (元) */
  prem_fr_orig_contr?: number;
  /** 保户储金净增加额 (元) */
  n_incr_insured_dep?: number;
  /** 收到再保业务现金净额 (元) */
  n_reinsur_prem?: number;
  /** 处置交易性金融资产净增加额 (元) */
  n_incr_disp_tfa?: number;
  /** 收取利息和手续费净增加额 (元) */
  ifc_cash_incr?: number;
  /** 处置可供出售金融资产净增加额 (元) */
  n_incr_disp_faas?: number;
  /** 拆入资金净增加额 (元) */
  n_incr_loans_oth_bank?: number;
  /** 回购业务资金净增加额 (元) */
  n_cap_incr_repur?: number;
  /** 收到其他与经营活动有关的现金 (元) */
  c_fr_oth_operate_a?: number;
  /** 经营活动现金流入小计 (元) */
  c_inf_fr_operate_a?: number;
  /** 购买商品、接受劳务支付的现金 (元) */
  c_paid_goods_s?: number;
  /** 支付给职工以及为职工支付的现金 (元) */
  c_paid_to_for_empl?: number;
  /** 支付的各项税费 (元) */
  c_paid_for_taxes?: number;
  /** 客户贷款及垫款净增加额 (元) */
  n_incr_clt_loan_adv?: number;
  /** 存放央行和同业款项净增加额 (元) */
  n_incr_dep_cbob?: number;
  /** 支付原保险合同赔付款项的现金 (元) */
  c_pay_claims_orig_inco?: number;
  /** 支付手续费的现金 (元) */
  pay_handling_chrg?: number;
  /** 支付保单红利的现金 (元) */
  pay_comm_insur_plcy?: number;
  /** 支付其他与经营活动有关的现金 (元) */
  oth_cash_pay_oper_act?: number;
  /** 经营活动现金流出小计 (元) */
  st_cash_out_act?: number;
  /** 经营活动产生的现金流量净额 (元) */
  n_cashflow_act?: number;

  // 投资活动现金流
  /** 收到其他与投资活动有关的现金 (元) */
  oth_recp_ral_inv_act?: number;
  /** 收回投资收到的现金 (元) */
  c_disp_withdrwl_invest?: number;
  /** 取得投资收益收到的现金 (元) */
  c_recp_return_invest?: number;
  /** 处置固定资产、无形资产和其他长期资产收回的现金净额 (元) */
  n_recp_disp_fiolta?: number;
  /** 处置子公司及其他营业单位收到的现金净额 (元) */
  n_recp_disp_sobu?: number;
  /** 投资活动现金流入小计 (元) */
  stot_inflows_inv_act?: number;
  /** 购建固定资产、无形资产和其他长期资产支付的现金 (元) */
  c_pay_acq_const_fiolta?: number;
  /** 投资支付的现金 (元) */
  c_paid_invest?: number;
  /** 取得子公司及其他营业单位支付的现金净额 (元) */
  n_disp_subs_oth_biz?: number;
  /** 支付其他与投资活动有关的现金 (元) */
  oth_pay_ral_inv_act?: number;
  /** 质押贷款净增加额 (元) */
  n_incr_pledge_loan?: number;
  /** 投资活动现金流出小计 (元) */
  stot_out_inv_act?: number;
  /** 投资活动产生的现金流量净额 (元) */
  n_cashflow_inv_act?: number;

  // 筹资活动现金流
  /** 取得借款收到的现金 (元) */
  c_recp_borrow?: number;
  /** 发行债券收到的现金 (元) */
  proc_issue_bonds?: number;
  /** 收到其他与筹资活动有关的现金 (元) */
  oth_cash_recp_ral_fnc_act?: number;
  /** 筹资活动现金流入小计 (元) */
  stot_cash_in_fnc_act?: number;
  /** 企业自由现金流量 (元) */
  free_cashflow?: number;
  /** 偿还债务支付的现金 (元) */
  c_prepay_amt_borr?: number;
  /** 分配股利、利润或偿付利息支付的现金 (元) */
  c_pay_dist_dpcp_int_exp?: number;
  /** 其中:子公司支付给少数股东的股利、利润 (元) */
  incl_dvd_profit_paid_sc_ms?: number;
  /** 支付其他与筹资活动有关的现金 (元) */
  oth_cashpay_ral_fnc_act?: number;
  /** 筹资活动现金流出小计 (元) */
  stot_cashout_fnc_act?: number;
  /** 筹资活动产生的现金流量净额 (元) */
  n_cash_flows_fnc_act?: number;

  // 现金汇总指标
  /** 汇率变动对现金的影响 (元) */
  eff_fx_flu_cash?: number;
  /** 现金及现金等价物净增加额 (元) */
  n_incr_cash_cash_equ?: number;
  /** 期初现金及现金等价物余额 (元) */
  c_cash_equ_beg_period?: number;
  /** 期末现金及现金等价物余额 (元) */
  c_cash_equ_end_period?: number;
  /** 吸收投资收到的现金 (元) */
  c_recp_cap_contrib?: number;
  /** 其中:子公司吸收少数股东投资收到的现金 (元) */
  incl_cash_rec_saims?: number;

  // 补充项目
  /** 未确认的投资损失 (元) */
  uncon_invest_loss?: number;
  /** 加:资产减值准备 (元) */
  prov_depr_assets?: number;
  /** 固定资产折旧、油气资产折耗、生产性生物资产折旧 (元) */
  depr_fa_coga_dpba?: number;
  /** 无形资产摊销 (元) */
  amort_intang_assets?: number;
  /** 长期待摊费用摊销 (元) */
  lt_amort_deferred_exp?: number;
  /** 待摊费用的减少 (元) */
  decr_deferred_exp?: number;
  /** 预提费用的增加 (元) */
  incr_acc_exp?: number;
  /** 处置固定资产、无形资产和其他长期资产的损失 (元) */
  loss_disp_fiolta?: number;
  /** 固定资产报废损失 (元) */
  loss_scr_fa?: number;
  /** 公允价值变动损失 (元) */
  loss_fv_chg?: number;
  /** 投资损失 (元) */
  invest_loss?: number;
  /** 递延所得税资产减少 (元) */
  decr_def_inc_tax_assets?: number;
  /** 递延所得税负债增加 (元) */
  incr_def_inc_tax_liab?: number;
  /** 存货的减少 (元) */
  decr_inventories?: number;
  /** 经营性应收项目的减少 (元) */
  decr_oper_payable?: number;
  /** 经营性应付项目的增加 (元) */
  incr_oper_payable?: number;
  /** 其他 (元) */
  others?: number;
  /** 经营活动产生的现金流量净额(间接法) (元) */
  im_net_cashflow_oper_act?: number;
  /** 债务转为资本 (元) */
  conv_debt_into_cap?: number;
  /** 一年内到期的可转换公司债券 (元) */
  conv_copbonds_due_within_1y?: number;
  /** 融资租入固定资产 (元) */
  fa_fnc_leases?: number;
  /** 现金的期末余额 (元) */
  end_bal_cash?: number;
  /** 减:现金的期初余额 (元) */
  beg_bal_cash?: number;
  /** 加:现金等价物的期末余额 (元) */
  end_bal_cash_equ?: number;
  /** 减:现金等价物的期初余额 (元) */
  beg_bal_cash_equ?: number;
  /** 现金及现金等价物的净增加额(间接法) (元) */
  im_n_incr_cash_equ?: number;
  /** 拆出资金净增加额 (元) */
  net_dism_capital_add?: number;
  /** 代理买卖证券收到的现金净额 (元) */
  net_cash_rece_sec?: number;
  /** 信用减值损失 (元) */
  credit_impa_loss?: number;
  /** 使用权资产折旧 (元) */
  use_right_asset_dep?: number;
  /** 其他资产减值损失 (元) */
  oth_loss_asset?: number;

  /** 更新标识: 1-最新数据 */
  update_flag?: string;
}
