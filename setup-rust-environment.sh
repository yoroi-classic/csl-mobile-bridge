#!/bin/bash

# Rust Environment Setup Script
# This script checks if the environment has the right tools to build Rust code
# and installs the missing ones.

set -e

# Configuration
MIN_RUST_VERSION="${MIN_RUST_VERSION:-1.70.0}"  # Minimum Rust version required
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to compare version strings
version_compare() {
    local version1=$1
    local version2=$2
    
    if [[ $version1 == $version2 ]]; then
        return 0
    fi
    
    local IFS=.
    local i ver1=($version1) ver2=($version2)
    
    # Fill empty fields with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    for ((i=${#ver2[@]}; i<${#ver1[@]}; i++)); do
        ver2[i]=0
    done
    
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Function to check if Rust is installed
check_rust_installed() {
    log_info "Checking if Rust is installed..."
    
    if ! command -v rustc &> /dev/null; then
        log_error "Rust is not installed"
        return 1
    fi
    
    log_success "Rust is installed"
    return 0
}

# Function to check Rust version
check_rust_version() {
    log_info "Checking Rust version..."
    
    local rust_version
    rust_version=$(rustc --version | cut -d' ' -f2)
    
    log_info "Current Rust version: $rust_version"
    log_info "Minimum required version: $MIN_RUST_VERSION"
    
    version_compare "$rust_version" "$MIN_RUST_VERSION"
    local result=$?
    
    if [[ $result -eq 2 ]]; then
        log_error "Rust version $rust_version is lower than required minimum $MIN_RUST_VERSION"
        return 1
    fi
    
    log_success "Rust version $rust_version meets requirements"
    return 0
}

# Function to install Rust
install_rust() {
    log_info "Installing Rust..."
    
    # Download and run rustup installer
    if command -v curl &> /dev/null; then
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    elif command -v wget &> /dev/null; then
        wget -qO- https://sh.rustup.rs | sh -s -- -y
    else
        log_error "Neither curl nor wget is available. Please install one of them and try again."
        return 1
    fi
    
    # Source the rust environment
    source "$HOME/.cargo/env"
    
    # Verify installation
    if command -v rustc &> /dev/null; then
        log_success "Rust installed successfully"
        return 0
    else
        log_error "Failed to install Rust"
        return 1
    fi
}

# Function to get required Rust targets
get_required_targets() {
    local targets=()
    
    # iOS targets
    targets+=("aarch64-apple-ios")          # iOS arm64
    targets+=("aarch64-apple-ios-sim")      # iOS Simulator arm64
    targets+=("x86_64-apple-ios")           # iOS Simulator x86_64
    
    # macOS targets (for development)
    targets+=("x86_64-apple-darwin")        # macOS x86_64
    targets+=("aarch64-apple-darwin")       # macOS arm64
    
    # Android targets
    targets+=("aarch64-linux-android")      # Android arm64
    targets+=("armv7-linux-androideabi")    # Android arm
    targets+=("i686-linux-android")         # Android x86
    targets+=("x86_64-linux-android")       # Android x86_64
    
    echo "${targets[@]}"
}

# Function to check if a Rust target is installed
is_target_installed() {
    local target=$1
    rustup target list --installed | grep -q "^$target$"
}

# Function to check and install required Rust targets
check_rust_targets() {
    log_info "Checking Rust targets..."
    
    local required_targets
    required_targets=($(get_required_targets))
    local missing_targets=()
    
    for target in "${required_targets[@]}"; do
        if is_target_installed "$target"; then
            log_success "Target $target is installed"
        else
            log_warning "Target $target is missing"
            missing_targets+=("$target")
        fi
    done
    
    if [[ ${#missing_targets[@]} -gt 0 ]]; then
        log_info "Installing missing Rust targets..."
        for target in "${missing_targets[@]}"; do
            log_info "Installing target: $target"
            if rustup target add "$target"; then
                log_success "Successfully installed target: $target"
            else
                log_error "Failed to install target: $target"
                return 1
            fi
        done
    else
        log_success "All required Rust targets are already installed"
    fi
    
    return 0
}

# Function to check for additional required tools
check_additional_tools() {
    log_info "Checking for additional build tools..."
    
    local missing_tools=()
    
    # Check for cmake (required for Android builds)
    if ! command -v cmake &> /dev/null; then
        log_warning "cmake is not installed (required for Android builds)"
        missing_tools+=("cmake")
    else
        log_success "cmake is available"
    fi
    
    # Check for make
    if ! command -v make &> /dev/null; then
        log_warning "make is not installed"
        missing_tools+=("make")
    else
        log_success "make is available"
    fi
    
    # Platform-specific checks
    case "$(uname -s)" in
        Darwin*)
            # Check for Xcode Command Line Tools on macOS
            if ! xcode-select -p &> /dev/null; then
                log_warning "Xcode Command Line Tools are not installed"
                missing_tools+=("xcode-command-line-tools")
            else
                log_success "Xcode Command Line Tools are available"
            fi
            ;;
        Linux*)
            # Check for basic build tools on Linux
            local build_essential=("gcc" "g++" "pkg-config" "libssl-dev")
            for tool in "${build_essential[@]}"; do
                if ! dpkg -l | grep -q "^ii.*$tool " 2>/dev/null && ! rpm -q "$tool" &> /dev/null 2>/dev/null; then
                    log_warning "$tool is not installed"
                    missing_tools+=("$tool")
                else
                    log_success "$tool is available"
                fi
            done
            ;;
    esac
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_warning "The following tools are missing and may be required for building:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        log_info "Please install these tools using your system's package manager:"
        echo "  macOS: xcode-select --install"
        echo "  Ubuntu/Debian: sudo apt-get install ${missing_tools[*]}"
        echo "  Fedora/CentOS: sudo dnf install ${missing_tools[*]}"
        echo "  Arch Linux: sudo pacman -S ${missing_tools[*]}"
    fi
}

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -v, --version VERSION    Set minimum Rust version (default: $MIN_RUST_VERSION)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  MIN_RUST_VERSION         Set minimum Rust version requirement"
    echo ""
    echo "Examples:"
    echo "  $0                       # Run with default settings"
    echo "  $0 --version 1.75.0     # Require Rust 1.75.0 or higher"
    echo "  MIN_RUST_VERSION=1.80.0 $0  # Set version via environment"
}

# Main function
main() {
    echo "========================================"
    echo "Rust Environment Setup Script"
    echo "========================================"
    echo ""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--version)
                MIN_RUST_VERSION="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    log_info "Project root: $PROJECT_ROOT"
    log_info "Minimum Rust version requirement: $MIN_RUST_VERSION"
    echo ""
    
    # Check and setup Rust
    if ! check_rust_installed; then
        if ! install_rust; then
            log_error "Failed to install Rust. Exiting."
            exit 1
        fi
    fi
    
    # Check Rust version
    if ! check_rust_version; then
        log_info "Attempting to update Rust..."
        if rustup update; then
            log_success "Rust updated successfully"
            if ! check_rust_version; then
                log_error "Updated Rust version still doesn't meet requirements. Exiting."
                exit 1
            fi
        else
            log_error "Failed to update Rust. Exiting."
            exit 1
        fi
    fi
    
    # Check Rust targets
    if ! check_rust_targets; then
        log_error "Failed to setup Rust targets. Exiting."
        exit 1
    fi
    
    # Check additional tools
    check_additional_tools
    
    echo ""
    echo "========================================"
    log_success "Rust environment setup completed successfully!"
    echo "========================================"
    echo ""
    log_info "You can now build the Rust components:"
    echo "  cargo build --release              # Build for host platform"
    echo "  cargo build --release --target <target>  # Build for specific target"
    echo ""
    log_info "Available targets:"
    rustup target list --installed | sed 's/^/  /'
}

# Run main function with all arguments
main "$@"
