#version 460 core

layout(location = 0) out vec4 FragColor;

in vec2 TexCoord;

uniform sampler2D texture0;
uniform vec2  resolution;
uniform vec4 track;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;
uniform vec3 angle;
uniform ivec3 check;
uniform vec3 border;
uniform vec3 min_size;
uniform vec3 weight;
uniform int mode;
uniform int invert;

vec4 rgbaToCmyk(vec4 rgba) {
   float c, m, y, k;
   k = min(1.0 - rgba.r, min(1.0 - rgba.g, 1.0 -rgba.b));
   c = 1.0 - rgba.r;
   m = 1.0 - rgba.g;
   y = 1.0 - rgba.b;
   return vec4(c, m, y, k);
}

vec2 rotate2D(vec2 st, float angle, vec2 center) {
   angle = radians(angle);
   st -= center;
   st = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * st;
   st += center;
   return st;
}

vec4 colorHalftone(sampler2D texture0, vec3 angle, vec3 colors[4], vec3 borders, vec3 min_sizes, vec3 weights, float t1, float t2, float t3, float t4, int invert, int mode, int i) {
   vec2 st = gl_FragCoord.xy / resolution.xy;
   float aspect_ratio = resolution.x / resolution.y;
   vec2 center = vec2(0.5);
   vec4 base_color = mix(vec4(1.0), vec4(0.0, 0.0, 0.0, 1.0), step(1.0, mode));
   vec4 circle_color = vec4(colors[i].r, colors[i].g, colors[i].b, 1.0);

   float border = mix(t2, borders[i], step(0.0, borders[i]) * step(borders[i], 1.0));
   float min_size = mix(t3, min_sizes[i], step(abs(min_sizes[i]), 1.0));
   float weight = mix(t4, weights[i], step(0.0, weights[i]) * step(weights[i], 1.0));

   st.x = mix(st.x, (st.x - 0.5) * aspect_ratio + 0.5, step(1.0, aspect_ratio));
   st.y = mix((st.y - 0.5) / aspect_ratio + 0.5, st.y, step(1.0, aspect_ratio));

   vec2 rotated_st = rotate2D(st, angle[i], center);
   rotated_st = (rotated_st - center) * t1 + center;

   vec2 i_st = floor(rotated_st);
   vec2 f_st = fract(rotated_st);

   for (int y = -1; y <= 1; ++y) {
      for (int x = -1; x <= 1; ++x) {
         vec2 neighbor = vec2(float(x), float(y));
         
         vec2 circle_center = i_st + neighbor + center;
         vec2 uv = ((circle_center - center) / t1 + center);
         uv = rotate2D(uv, -angle[i], center);

         uv.x = mix(uv.x, (uv.x - 0.5) / aspect_ratio + 0.5, step(1.0, aspect_ratio));
         uv.y = mix((uv.y - 0.5) * aspect_ratio + 0.5, uv.y, step(1.0, aspect_ratio));
         
         vec4 tex_color = texture2D(texture0, uv);
         tex_color = mix(rgbaToCmyk(tex_color), tex_color, step(1.0, mode));

         float circle_radius = 0.5 * min_size + 0.5 * weight * mix(tex_color[i], 1.0 - tex_color[i], step(1.0, invert));
         float dist = length(neighbor + center - f_st);
         
         float circle_edge = smoothstep(circle_radius, circle_radius + border, dist);
         base_color = mix(base_color, circle_color, 1.0 - circle_edge);
      }
   }
   return vec4(base_color.rgb, 1.0);
}

void main() {
   float t1 = track.x, t2 = track.y, t3 = track.z, t4 = track.w;
   vec3 colors[4] = vec3[](color1, color2, color3, color4);
   vec4 bg_color = vec4(colors[3].r, colors[3].g, colors[3].b, 1.0);
   float alpha = texture(texture0, TexCoord).a;
   vec4 result_color1 = mix(vec4(1.0), vec4(0.0, 0.0, 0.0, 1.0), step(1.0, mode));
   vec4 result_color2 = mix(vec4(1.0), vec4(0.0, 0.0, 0.0, 1.0), step(1.0, mode));
   vec4 result_color3 = mix(vec4(1.0), vec4(0.0, 0.0, 0.0, 1.0), step(1.0, mode));

   result_color1 = (check.x == 1) ? colorHalftone(texture0, angle, colors, border, min_size, weight, t1, t2, t3, t4, invert, mode, 0) : result_color1;
   result_color2 = (check.y == 1) ? colorHalftone(texture0, angle, colors, border, min_size, weight, t1, t2, t3, t4, invert, mode, 1) : result_color2;
   result_color3 = (check.z == 1) ? colorHalftone(texture0, angle, colors, border, min_size, weight, t1, t2, t3, t4, invert, mode, 2) : result_color3;
   vec4 final_color = (mode == 1) ? result_color1 + result_color2 + result_color3 + bg_color : result_color1 * result_color2 * result_color3 * bg_color;

   FragColor = vec4(pow(final_color.rgb, vec3(1.0/2.2)), alpha);
}