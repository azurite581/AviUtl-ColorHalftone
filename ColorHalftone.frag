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
uniform vec3 check;
uniform vec3 border;
uniform vec3 min_size;
uniform vec3 max_size;
uniform float mode;
uniform float invert;

vec3 rgbToCmy(vec3 rgb) {
   return vec3(1.0) - rgb;
}

vec2 rotate2D(vec2 st, float angle, vec2 center) {
   angle = radians(angle);
   st -= center;
   st = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * st;
   st += center;
   return st;
}

vec4 colorHalftone(sampler2D texture0, vec3 angle, vec3 colors[4], vec3 borders, vec3 min_sizes, vec3 max_sizes, float t1, float t2, float t3, float t4, float invert, float mode, int i) {
   vec2 st = gl_FragCoord.xy / resolution.xy;
   float aspect_ratio = resolution.x / resolution.y;
   vec2 center = vec2(0.5);
   vec4 base_color = mix(vec4(1.0), vec4(0.0, 0.0, 0.0, 1.0), step(1.0, mode));
   vec4 circle_color = vec4(colors[i].r, colors[i].g, colors[i].b, 1.0);
   float pixel_size = 1.0 / min(resolution.x, resolution.y);

   float border = mix(t2, borders[i], step(0.0, borders[i]) * step(borders[i], 1.0));
   float min_size = mix(t3, min_sizes[i], step(0.0, min_sizes[i]) * step(min_sizes[i], 1.0));
   float max_size = mix(t4, max_sizes[i], step(0.0, max_sizes[i]) * step(max_sizes[i], 2.0));

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

         vec3 cmy_color = rgbToCmy(tex_color.rgb);
         vec3 color_value = mix(cmy_color, tex_color.rgb, step(1.0, mode));
         color_value.rgb = mix(sqrt(color_value.rgb / vec3(1.0)), color_value.rgb, step(1.0, mode));

         float circle_radius = 0.5 * min_size + 0.5 * max_size * mix(color_value[i], 1.0 - color_value[i], step(1.0, invert));
         float dist = length(neighbor + center - f_st);

         float aa_width = pixel_size * t1;
  
         float circle_edge = smoothstep(circle_radius - aa_width, circle_radius + aa_width + border, dist);
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

   result_color1 = (check.x == 1.0) ? colorHalftone(texture0, angle, colors, border, min_size, max_size, t1, t2, t3, t4, invert, mode, 0) : result_color1;
   result_color2 = (check.y == 1.0) ? colorHalftone(texture0, angle, colors, border, min_size, max_size, t1, t2, t3, t4, invert, mode, 1) : result_color2;
   result_color3 = (check.z == 1.0) ? colorHalftone(texture0, angle, colors, border, min_size, max_size, t1, t2, t3, t4, invert, mode, 2) : result_color3;
   vec4 final_color = (mode == 1.0) ? result_color1 + result_color2 + result_color3 + bg_color : result_color1 * result_color2 * result_color3 * bg_color;

   FragColor = vec4(final_color.rgb, alpha);
}