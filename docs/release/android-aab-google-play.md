```bash
cd android/app

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore lichka-release.keystore \
  -alias lichka-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# CN / OU / O / L / ST / C — ответить на вопросы keytool
# или одной строкой:
# keytool -genkeypair -v -storetype PKCS12 -keystore lichka-release.keystore -alias lichka-release -keyalg RSA -keysize 2048 -validity 10000 -storepass 'STORE_PASS' -keypass 'KEY_PASS' -dname "CN=First Last, OU=Mobile, O=Lichka, L=Moscow, ST=Moscow, C=RU"

keytool -list -v -keystore lichka-release.keystore -alias lichka-release

# ~/.gradle/gradle.properties:
# LICHKA_UPLOAD_STORE_FILE=lichka-release.keystore
# LICHKA_UPLOAD_KEY_ALIAS=lichka-release
# LICHKA_UPLOAD_STORE_PASSWORD=STORE_PASS
# LICHKA_UPLOAD_KEY_PASSWORD=KEY_PASS

# android/app/build.gradle — signingConfigs.release + buildTypes.release.signingConfig = signingConfigs.release
# versionCode++ / versionName

cd ../../android
./gradlew clean bundleRelease

# android/app/build/outputs/bundle/release/app-release.aab
```
