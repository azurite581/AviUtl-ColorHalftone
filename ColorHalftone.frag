#version 460 core

in vec2 TexCoord;

layout(location = 0) out vec4 FragColor;

uniform sampler2D texture0;
uniform vec2  resolution;
uniform vec4 track;

uniform float aspect_ratio;

uniform float tone_size;
uniform float radius;
uniform float min_radius;
uniform float max_radius;

uniform vec3 visibility;
uniform vec3 tone_color1;
uniform vec3 tone_color2;
uniform vec3 tone_color3;
uniform vec3 bg_color;
uniform mat2 rot1;
uniform mat2 rot2;
uniform mat2 rot3;
uniform mat2 rot1T;
uniform mat2 rot2T;
uniform mat2 rot3T;
uniform float mix_mode;

vec2 adjustAspectRatio(vec2 st, bool revert) {
    st.x = mix(mix(st.x, (st.x - 0.5) * aspect_ratio + 0.5, step(1.0, aspect_ratio)), 
               mix(st.x, (st.x - 0.5) / aspect_ratio + 0.5, step(1.0, aspect_ratio)), revert);
    st.y = mix(mix((st.y - 0.5) / aspect_ratio + 0.5, st.y, step(1.0, aspect_ratio)),
               mix((st.y - 0.5) * aspect_ratio + 0.5, st.y, step(1.0, aspect_ratio)), revert);
    return st;
}

vec2 rotate(vec2 st, mat2 rot) {
    st -= vec2(0.5);
    st *= rot;
    st += vec2(0.5);
    return st;
}

vec2 scale(vec2 st, float n, bool scale_down) {
    st -= vec2(0.5);
    st = scale_down ? st / n : st * n;
    st += vec2(0.5);
    return st;
}

vec3 rgbToCmy(vec3 rgb) {
   return vec3(1.0) - rgb;
}

// 参考: https://qiita.com/aa_debdeb/items/b51529e6b0170f9c48e4
float smoothThresholdA(float thr, float min_thr, float max_thr, float s, float x) {
    float inv_range = 1.0 / (max_thr - min_thr);
    float edge = thr + s * (thr - min_thr) * inv_range;
    return smoothstep(edge - s, edge, x);
}

vec3 colorHalftone(int idx, mat2 rot, mat2 rotT, vec3 tone_color) {
    vec2 st = adjustAspectRatio(TexCoord, false);  // アスペクト比を調整
    st = rotate(st, rot);              // 回転
    st = scale(st, tone_size, false);  // スケーリング

    vec2 i_st = floor(st);  // 各セルの番号
    vec2 f_st = fract(st);  // セル内の座標

    float smoothness = 1.0 / min(resolution.x, resolution.y) * tone_size;

    vec3 result_color = bg_color;

    // 隣接セルを走査
    for (int y = -1; y <= 1; ++y) {
        for (int x = -1; x <= 1; ++x) {
            vec2 neighbor = vec2(float(x), float(y));

            // 隣接セルの中心の絶対座標を計算
            vec2 uv =  i_st + neighbor + vec2(0.5);

            uv = scale(uv, tone_size, true);   // 逆スケーリング
            uv = rotate(uv, rotT);             // 逆回転
            uv = adjustAspectRatio(uv, true);  // アスペクト比を元に戻す

            vec3 rgb_color = texture(texture0, uv).rgb;
            vec3 color_value = mix(rgbToCmy(rgb_color), rgb_color, step(1, mix_mode));
            color_value = pow(color_value, vec3(1 / 2.2));  // 微調整

            // サンプリングした色に基づいて半径の大きさを決定
            float radius_value = radius * (color_value[idx]);
            radius_value = radius_value +
                           min_radius * (radius - radius_value) +
                           max_radius * ((radius - 0.5) - radius_value);

            // 隣接セルの中心への距離を計算
            vec2 diff = neighbor + vec2(0.5) - f_st;
            float dist = length(diff);
            
            // 現在注目しているピクセルが半径より内側に位置する場合は 0、外側に位置する場合は 1 を返す
            // +-smoothnessの間に位置する場合は、トーンカラーと背景色の間を滑らかにブレンドする
            float blend = smoothThresholdA(radius_value, 0.0, 1.0, smoothness, dist);
            result_color = mix(tone_color, result_color, blend);
        }
    }
    return result_color;
}

void main() {
    float alpha = texture(texture0, TexCoord).a;

    vec3 color1 = mix(bg_color, colorHalftone(0, rot1, rot1T, tone_color1), visibility.x);
    vec3 color2 = mix(bg_color, colorHalftone(1, rot2, rot2T, tone_color2), visibility.y);
    vec3 color3 = mix(bg_color, colorHalftone(2, rot3, rot3T, tone_color3), visibility.z);

    vec3 final_color =  mix(vec3(color1 * color2 * color3), vec3(color1 + color2 + color3), mix_mode);
    FragColor = vec4(final_color, alpha);
}
