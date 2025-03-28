FROM ubuntu

# Tránh các prompt tương tác trong quá trình cài đặt
ENV DEBIAN_FRONTEND=noninteractive

# Cài đặt các gói cần thiết
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    openjdk-21-jdk-headless \
    wget \
    android-sdk \
    python3 \
    python3-pip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Thiết lập biến môi trường
ENV ANDROID_SDK_ROOT=/usr/lib/android-sdk
ENV PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools

# Tạo người dùng non-root
RUN groupadd --gid 1001 developer \
    && useradd --uid 1001 --gid developer --shell /bin/bash --create-home developer

# Thiết lập các thư mục làm việc
WORKDIR /home/developer

# Chuyển sang người dùng developer
USER developer


# Cài đặt các công cụ Android
RUN mkdir -p /home/developer/Android/sdk/cmdline-tools \
    && cd /home/developer/Android/sdk/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip \
    && unzip commandlinetools-linux-9477386_latest.zip \
    && rm commandlinetools-linux-9477386_latest.zip \
    && mkdir latest \
    && mv cmdline-tools/* latest/ \
    && rmdir cmdline-tools

# Thiết lập biến môi trường Android
ENV ANDROID_HOME=/home/developer/Android/sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Chấp nhận giấy phép Android
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# Đặt điểm vào cho container
CMD ["bash"]