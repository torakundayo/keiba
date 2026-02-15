export function TierLegend() {
  return (
    <section className="mt-4 space-y-4 text-xs text-slate-500">
      <div>
        <p className="font-medium text-slate-600 mb-1.5">確率順位について</p>
        <p>
          各組み合わせは複勝オッズから推定した的中確率の高い順にランク付けされています。
          バックテスト（774レース）では、的中した組み合わせの中央順位は16位（全体の約4%の位置）でした。
        </p>
      </div>
      <div>
        <p className="font-medium text-slate-600 mb-1.5">点数と回収率のトレードオフ</p>
        <p>
          購入点数を増やすと的中率は上がりますが、1点あたりの期待回収率は下がります。
          バックテストでは3点買いで的中率21%・回収率45%、10点買いで的中率39%・回収率33%でした。
          最も損失が少ないのは少数精鋭の購入です。
        </p>
      </div>
      <div>
        <p className="font-medium text-slate-600 mb-1.5">期待回収率</p>
        <p>100円を賭けた場合に平均で何円返ってくるかを示します。100%以上なら利益見込み、100%未満なら損失見込みです。市場効率のため、全組み合わせの加重平均は約75%（JRA控除率）に収束します。</p>
      </div>
    </section>
  )
}
