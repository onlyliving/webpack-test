'use strict';

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// OptimizeCSSAssetsPlugin css 압축
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");


module.exports = (env, options) => {
  var config = {
    entry: {
      //string, object, object + array 모두 가능
      'mobile/page1/dist/page1': [path.resolve(__dirname, 'assets/mobile/js/m_page1.js')],
      'mobile/page2/dist/page2': [path.resolve(__dirname, 'assets/mobile/js/m_page2.js')],
      'dist/index': [path.resolve(__dirname, 'assets/js/index.js')],
      'service/dist/service': [path.resolve(__dirname, 'assets/js/service.js')],
    },
    output: {
      // 결과물을 저장할 위치
      path: path.resolve(__dirname, './'),

      // 결과물 파일명
      // app.js -> app.js
      // [name].js -> entry에서 설정한 이름(object key).js
      // [hash].js -> 빌드마다 변경되는 해시.js
      // [chunkhash].js -> 파일 고유의 해시(파일이 달라질 경우 변경됨).js
      filename: '[name].bundle.[chunkhash].js',

      // publicPath : 파일들이 위치할 서버 상의 경로, CDN 주소 사용 가능
    },
    plugins: [
      // 웹팩 초기화 로직까지 분리 (번들링 할 때마다 코드를 가져갈 필요 없다)
      new ManifestPlugin({
        fileName: 'manifest.json',
        basePath: __dirname
      }),

      // new ExtractTextPlugin({
      //   filename: '[name].css',
      // }),

      //MiniCssExtractPlugin
      //항목 이름을 기반으로 CSS를 추출
      //항목에 따라 CSS를 번들로 유지하려는 경우 특히 유용
      // ExtractTextPlugin에있는 CSS 복제 문제를 방지
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),

      // https://github.com/jantimon/html-webpack-plugin#options
      // TODO 디버깅 : HtmlWebpackPlugin을 이용하면 번들 후 각각 dist폴더는 만들어지는데, 문제는 dist폴더 안에 있는 자동 링크가 해당 파일만 있는 것이 아니라 번들된 모든 css, js가 삽입되는 문제
      new HtmlWebpackPlugin({
        filename: 'mobile/page1/dist/index.html',
        template: 'mobile/page1/index.html',
      }),
      new HtmlWebpackPlugin({
        filename: 'mobile/page2/dist/index.html',
        template: 'mobile/page2/index.html',
      }),
      new HtmlWebpackPlugin({
        filename: 'dist/index.html',
        template: 'index.html',
      }),
      new HtmlWebpackPlugin({
        filename: 'service/dist/index.html',
        template: 'service/index.html',
      }),
    ],
    // module.rules : 로더(loader)에 대한 옵션
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          //TODO 바벨로더 최적화 필요?
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        },
        // {
        //   test: /\.css$/,
        //   use: ExtractTextPlugin.extract({
        //     fallback: 'style-loader',
        //     use: [
        //       {
        //         loader: 'css-loader',
        //         options: {
        //           // If you are having trouble with urls not resolving add this setting.
        //           // See https://github.com/webpack-contrib/css-loader#url
        //           minimize: true,
        //           sourceMap: true
        //         }
        //       },
        //     ],
        //   }),
        // },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ],
        },
        {
          //설정한 사이즈보다 작은 이미지나 폰트 파일을 인라인화
          //인라인하면 번들 크기는 커지지만 request 요청 수가 줄어든다.
          //작은 이미지/폰트만 inline, 큰 이미지는 file
          test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
          loader: 'url-loader',
          options: {
            //[ext]는 현재 확장자를 그대로 사용)
            //file-loader 사용될 시 output 파일 이름
            //TODO 디버깅 : file-loader 이미지 경로 버그. 네임과 실제 빌드되는 파일경로가 맞지 않음. 빌드파일이 한단계 위에 생긴다. outputPath 로도 안됨
            name: '[name].[ext]?[hash]',
            //크기가 10000보다 같거나 작으면 url-loader 사용
            //크기가 10000보다 크면 file-loader 사용
            limit: 10000,
            // fallback: 'file-loader'
          },
        }]
    },
    // optimization : 최적화 관련 플러그인
    optimization: {
      // removeEmptyChunks 비어있는 청크를 감지하고 제거
      removeEmptyChunks: true,
      // 구 CommonsChunk 플러그인 사용 옵션
      //TODO 최적화 작업 필요. (전역적으로 사용하는 프레임워크만! 나머진 종속적으로 동적 가능하도록 처리해야 함)
      splitChunks: {
        cacheGroups: {
          default: false,
          commons: {
            //이로 인해 모든 외부 패키지가 포함 된 큰 덩어리가 생성 될 수 있습니다.
            //핵심 프레임 워크 및 유틸리티 만 포함시키고 나머지 종속성은 동적으로 로드하는 것이 좋습니다.
            // test: /node_modules/를 제거하면 공통 css 하나로 묶임!!!
            test: /node_modules/,
            name: "commons",
            chunks: "initial",
            minChunks: 1,
            minSize: 0
          }
        }
      },
      // 구 Uglify 플러그인 사용 옵션
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true // set to true if you want JS source maps
        }),
        //css 압축
        new OptimizeCSSAssetsPlugin({}),
      ]
    },
    // 웹팩이 알아서 경로나 확장자를 처리할 수 있게 도와주는 옵션
    resolve: {
      modules: [
        './node_modules'
      ],
      extensions: ['.js', '.json', '.jsx', '.css'],
    },
  };

  if(options.mode === 'development') {
    // development 모드일 경우

    // module: {
    //   rules: [
    //     {
    //       test: /\.js$/,
    //       exclude: /node_modules/,
    //       loader: "eslint-loader",
    //     },
    //   ]
    // }

  } else {
    // production 모드일 경우
    // optimization 최적화 관련 플러그인
    optimization: {
      // To keep filename consistent between different modes
      //webpack에게 모듈의 순서를 알아내어 가장 작은 초기 번들이되도록 지시.
      //기본적으로 optimization.occurrenceOrder는 프로덕션 모드에서 사용되며 다른 모드에서는 사용 불가능
      // occurrenceOrder: true
    }
  }

  return config;
}




