/**
 * Harvilleモデル: 競馬の着順確率を条件付き確率で計算する
 *
 * 単純積モデル: P(i,j,k) = p_i × p_j × p_k
 * Harvilleモデル: P(1着=a, 2着=b, 3着=c) = p_a × p_b/(1-p_a) × p_c/(1-p_a-p_b)
 *
 * 1着が決まると、その馬はプールから除外され、
 * 残りの馬の確率が条件付きで再配分される。
 */

/** 特定の着順 (1着=a, 2着=b, 3着=c) の確率 */
function harvillePermutation(pA: number, pB: number, pC: number): number {
  const denom1 = 1 - pA
  const denom2 = 1 - pA - pB
  if (denom1 <= 1e-12 || denom2 <= 1e-12) return 0
  return pA * (pB / denom1) * (pC / denom2)
}

/** 3連複（順不同）: 6つの順列の合計 */
export function harvilleTrifecta(pi: number, pj: number, pk: number): number {
  return harvillePermutation(pi, pj, pk)
       + harvillePermutation(pi, pk, pj)
       + harvillePermutation(pj, pi, pk)
       + harvillePermutation(pj, pk, pi)
       + harvillePermutation(pk, pi, pj)
       + harvillePermutation(pk, pj, pi)
}
