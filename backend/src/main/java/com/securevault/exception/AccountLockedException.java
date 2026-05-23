package com.securevault.exception;

public class AccountLockedException extends RuntimeException {
    public AccountLockedException(String msg) { super(msg); }
}
