// 提取枚举的真实值类型（排除反向映射）
type EnumValue<T> = T extends Record<string, infer V> ? (V extends string | number ? V : never) : never;

// 约束为 TS 枚举类型（键为枚举名，值为枚举值）
interface EnumObject<T extends string | number> {
  [K: string]: T;
  // 确保是枚举（至少有一个字符串键）
  [key: symbol]: never;
}

// 自动推导枚举值类型
export function enumToOptions<E extends EnumObject<EnumValue<E>>>(
  enumObj: E,
  labelMap: Record<EnumValue<E>, string>,
): Array<{ label: string; value: EnumValue<E> }> {
  return (
    Object.keys(enumObj)
      // 数字枚举会生成反向映射（如 "0" -> "Pending"），这里过滤掉数字 key
      .filter((key) => Number.isNaN(Number(key)))
      .map((key) => {
        const value = enumObj[key] as EnumValue<E>;
        return {
          label: labelMap[value],
          value,
        };
      })
  );
}
