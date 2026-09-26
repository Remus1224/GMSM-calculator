@echo off
setlocal
cd /d "%~dp0"

echo [1/4] Copy browser-accepted Beta player to production path...
copy /Y "beta\light-sanctum-pray\runtime\player-presentation.js" "light-sanctum-pray\runtime\player-presentation.js" >nul || goto :fail

echo [2/4] Update production runtime cache version...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='light-sanctum-pray\runtime\index.html';$t=[IO.File]::ReadAllText($p);$old='player-presentation.js?v=20260926-cost-fit-r2';$new='player-presentation.js?v=20260926-preset-r1';$oldCount=([regex]::Matches($t,[regex]::Escape($old))).Count;$newCount=([regex]::Matches($t,[regex]::Escape($new))).Count;if($oldCount -eq 1 -and $newCount -eq 0){$t=$t.Replace($old,$new);[IO.File]::WriteAllText($p,$t,(New-Object Text.UTF8Encoding($false)))}elseif($oldCount -eq 0 -and $newCount -eq 1){Write-Host 'runtime cache marker already updated'}else{throw ('runtime cache marker mismatch old='+$oldCount+' new='+$newCount)}" || goto :fail

echo [3/4] Update outer page cache version...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='light-sanctum-pray\index.html';$t=[IO.File]::ReadAllText($p);$old='runtime/index.html?v=20260926-cost-fit-r2';$new='runtime/index.html?v=20260926-preset-r1';$oldCount=([regex]::Matches($t,[regex]::Escape($old))).Count;$newCount=([regex]::Matches($t,[regex]::Escape($new))).Count;if($oldCount -eq 1 -and $newCount -eq 0){$t=$t.Replace($old,$new);[IO.File]::WriteAllText($p,$t,(New-Object Text.UTF8Encoding($false)))}elseif($oldCount -eq 0 -and $newCount -eq 1){Write-Host 'outer cache marker already updated'}else{throw ('outer cache marker mismatch old='+$oldCount+' new='+$newCount)}" || goto :fail

echo [4/4] Verify production player matches accepted Beta player...
fc /B "beta\light-sanctum-pray\runtime\player-presentation.js" "light-sanctum-pray\runtime\player-presentation.js" >nul || goto :fail

echo.
echo PROMOTION READY.
echo Open GitHub Desktop. You should see these production-path changes:
echo   light-sanctum-pray\runtime\player-presentation.js
echo   light-sanctum-pray\runtime\index.html
echo   light-sanctum-pray\index.html
echo.
echo Do NOT merge yet. Send the GitHub Desktop Changes screen for review first.
echo.
pause
exit /b 0

:fail
echo.
echo PROMOTION FAILED. No merge should be performed.
pause
exit /b 1
