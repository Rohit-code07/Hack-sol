@echo off
set DIR=%~dp0
"%DIR%apache-maven-3.9.9\bin\mvn.cmd" -Dmaven.repo.local="%DIR%.m2\repository" %*
